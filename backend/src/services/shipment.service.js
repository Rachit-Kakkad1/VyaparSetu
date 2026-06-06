const { Shipment, ShipmentTrackingLog, PurchaseOrder, Vendor, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');

class ShipmentService {
  async dispatchShipment(poId, vendorId, origin, destination) {
    const t = await sequelize.transaction();
    try {
      const po = await PurchaseOrder.findByPk(poId);
      if (!po) throw new AppError('Purchase Order not found', 404);
      if (po.vendorId !== vendorId) throw new AppError('Unauthorized: You can only dispatch your own PO', 403);
      if (po.status !== 'ACCEPTED' && po.status !== 'ISSUED') throw new AppError('PO must be accepted to dispatch', 400);

      const shipment = await Shipment.create({
        shipmentNumber: 'SHP-' + Date.now(),
        poId,
        vendorId,
        status: 'IN_TRANSIT',
        originLat: origin.lat,
        originLng: origin.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        currentLat: origin.lat,
        currentLng: origin.lng,
        progressPercentage: 0,
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000) // 30 mins from now for demo
      }, { transaction: t });

      await po.update({ status: 'DELIVERED' }, { transaction: t }); // Simulating immediate status change or IN_PROGRESS

      await t.commit();

      // Start Simulation
      this.startSimulation(shipment.id);

      await logActivity(vendorId, 'DISPATCH_SHIPMENT', 'Shipment', shipment.id, 'Shipment dispatched by vendor', null);

      return shipment;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async startSimulation(shipmentId) {
    const interval = 10 * 1000; // Update every 10 seconds
    const totalSteps = 10; // Reach destination in 10 steps (100 seconds)
    let currentStep = 0;

    const timer = setInterval(async () => {
      try {
        const shipment = await Shipment.findByPk(shipmentId);
        if (!shipment || shipment.isDelivered) {
          clearInterval(timer);
          return;
        }

        currentStep++;
        const progress = (currentStep / totalSteps) * 100;
        
        // Linear Interpolation for simulation
        const lat = shipment.originLat + (shipment.destinationLat - shipment.originLat) * (currentStep / totalSteps);
        const lng = shipment.originLng + (shipment.destinationLng - shipment.originLng) * (currentStep / totalSteps);

        shipment.currentLat = lat;
        shipment.currentLng = lng;
        shipment.progressPercentage = progress;

        if (progress >= 100) {
          shipment.status = 'DELIVERED';
          shipment.isDelivered = true;
          shipment.actualArrival = new Date();
          clearInterval(timer);
        }

        await shipment.save();

        // Log tracking point
        await ShipmentTrackingLog.create({
          shipmentId: shipment.id,
          latitude: lat,
          longitude: lng
        });

        // Trigger Notifications
        await this.handleMilestoneNotifications(shipment);

      } catch (err) {
        console.error('Simulation step failed:', err);
        clearInterval(timer);
      }
    }, interval);
  }

  async handleMilestoneNotifications(shipment) {
    const po = await PurchaseOrder.findByPk(shipment.poId);
    const recipients = [po.generatedById]; // Manager/Procurement Officer who created PO

    if (shipment.progressPercentage >= 75 && shipment.progressPercentage < 80) {
      for (const uid of recipients) {
        await notificationService.createNotification(uid, 'Shipment Update', 'Shipment ' + shipment.shipmentNumber + ' is 75% complete.', 'SHIPMENT_PROGRESS', '/shipments/' + shipment.id);
      }
    }

    if (shipment.isDelivered) {
      for (const uid of recipients) {
        await notificationService.createNotification(uid, 'Shipment Delivered', 'Shipment ' + shipment.shipmentNumber + ' has arrived at the destination.', 'SHIPMENT_DELIVERED', '/shipments/' + shipment.id);
      }
    }
  }

  async getShipmentById(id) {
    const shipment = await Shipment.findByPk(id, {
      include: [
        { model: ShipmentTrackingLog, as: 'trackingLogs', order: [['timestamp', 'ASC']] },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    if (!shipment) throw new AppError('Shipment not found', 404);
    return shipment;
  }

  async getAllShipments(query, user) {
    const where = {};
    if (user.role.name === 'VENDOR') {
      // In real scenario, link user to vendorId
      // where.vendorId = ...
    }
    return await Shipment.findAll({ where, order: [['createdAt', 'DESC']] });
  }
}

module.exports = new ShipmentService();
