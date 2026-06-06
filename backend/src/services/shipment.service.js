const { Shipment, ShipmentTrackingLog, PurchaseOrder, Vendor, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');
const mapplsService = require('./mappls.service');
const { decodePolyline } = require('../utils/polyline');

class ShipmentService {
  async dispatchShipment(poId, vendorId, origin, destination) {
    const t = await sequelize.transaction();
    try {
      const po = await PurchaseOrder.findByPk(poId);
      if (!po) throw new AppError('Purchase Order not found', 404);
      if (po.vendorId !== vendorId) throw new AppError('Unauthorized: You can only dispatch your own PO', 403);
      if (po.status !== 'ACCEPTED' && po.status !== 'ISSUED') throw new AppError('PO must be accepted to dispatch', 400);

      // Fetch Real Route from Mappls
      let routeData = await mapplsService.getRoute(origin, destination);
      let routePoints = [];
      let routeGeometry = '';
      let estimatedArrival = new Date(Date.now() + 30 * 60 * 1000); // Default 30 min

      if (routeData) {
        routeGeometry = routeData.geometry;
        routePoints = decodePolyline(routeGeometry);
        // Mappls duration is in seconds
        estimatedArrival = new Date(Date.now() + (routeData.duration * 1000));
      } else {
        // Fallback to linear if API fails (Hackathon safety)
        console.warn('Mappls Route API failed, falling back to linear mock');
        routePoints = [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng]
        ];
      }

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
        estimatedArrival: estimatedArrival,
        routeGeometry: routeGeometry,
        routePoints: routePoints
      }, { transaction: t });

      await po.update({ status: 'DELIVERED' }, { transaction: t }); // Or SHIPPED if model has it

      await t.commit();

      // Start Real-Road Simulation
      this.startSimulation(shipment.id);

      await logActivity(vendorId, 'DISPATCH_SHIPMENT', 'Shipment', shipment.id, 'Shipment dispatched by vendor (Mappls Route)', null);

      return shipment;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async startSimulation(shipmentId) {
    const interval = process.env.SIMULATION_INTERVAL || 5000; // 5 seconds
    
    const timer = setInterval(async () => {
      try {
        const shipment = await Shipment.findByPk(shipmentId);
        if (!shipment || shipment.isDelivered) {
          clearInterval(timer);
          return;
        }

        const points = shipment.routePoints;
        if (!points || points.length === 0) {
            clearInterval(timer);
            return;
        }

        // Advance one index in the route points array
        // We calculate current index based on time or just track it.
        // For a demonstration, let's just move 5% or 1 point every interval.
        let currentIndex = Math.floor((shipment.progressPercentage / 100) * points.length);
        currentIndex += 1;

        if (currentIndex >= points.length) {
          shipment.status = 'DELIVERED';
          shipment.isDelivered = true;
          shipment.progressPercentage = 100;
          shipment.currentLat = shipment.destinationLat;
          shipment.currentLng = shipment.destinationLng;
          shipment.actualArrival = new Date();
          clearInterval(timer);
        } else {
          const [lat, lng] = points[currentIndex];
          shipment.currentLat = lat;
          shipment.currentLng = lng;
          shipment.progressPercentage = (currentIndex / points.length) * 100;
        }

        await shipment.save();

        await ShipmentTrackingLog.create({
          shipmentId: shipment.id,
          latitude: shipment.currentLat,
          longitude: shipment.currentLng
        });

        await this.handleMilestoneNotifications(shipment);

      } catch (err) {
        console.error('Simulation step failed:', err);
        clearInterval(timer);
      }
    }, interval);
  }

  async handleMilestoneNotifications(shipment) {
    const po = await PurchaseOrder.findByPk(shipment.poId);
    const recipients = [po.generatedById]; 

    // Mappls Distance Matrix for Dynamic ETA during movement
    // (Only every few steps to avoid API spam)
    if (Math.floor(shipment.progressPercentage) % 25 === 0 && !shipment.isDelivered) {
        const matrix = await mapplsService.getDistanceMatrix(
            { lat: shipment.currentLat, lng: shipment.currentLng },
            { lat: shipment.destinationLat, lng: shipment.destinationLng }
        );
        if (matrix) {
            shipment.estimatedArrival = new Date(Date.now() + (matrix.duration * 1000));
            await shipment.save();
        }
    }

    if (shipment.progressPercentage >= 75 && shipment.progressPercentage < 80) {
      for (const uid of recipients) {
        await notificationService.createNotification(uid, 'Shipment Update', 'Shipment ' + shipment.shipmentNumber + ' is 75% complete.', 'SHIPMENT_PROGRESS', '/shipments/' + shipment.id);
      }
    }

    // ETA based notifications
    const etaMinutes = (shipment.estimatedArrival - Date.now()) / (60 * 1000);
    if (etaMinutes <= 20 && etaMinutes > 15) {
        // Trigger 20 min notification
    }

    if (shipment.isDelivered) {
      for (const uid of recipients) {
        await notificationService.createNotification(uid, 'Shipment Delivered', 'Shipment ' + shipment.shipmentNumber + ' has arrived.', 'SHIPMENT_DELIVERED', '/shipments/' + shipment.id);
      }
    }
  }

  async getShipmentById(id) {
    return await Shipment.findByPk(id, {
      include: [
        { model: ShipmentTrackingLog, as: 'trackingLogs', order: [['timestamp', 'ASC']] },
        { model: PurchaseOrder, as: 'purchaseOrder' }
      ]
    });
  }

  async getRoute(id) {
      const shipment = await Shipment.findByPk(id, { attributes: ['routeGeometry', 'originLat', 'originLng', 'destinationLat', 'destinationLng'] });
      if (!shipment) throw new AppError('Shipment not found', 404);
      return {
          geometry: shipment.routeGeometry,
          origin: { lat: shipment.originLat, lng: shipment.originLng },
          destination: { lat: shipment.destinationLat, lng: shipment.destinationLng }
      };
  }

  async getAllShipments(query, user) {
    return await Shipment.findAll({ order: [['createdAt', 'DESC']] });
  }

  async getDashboardSummary() {
    const total = await Shipment.count();
    const inTransit = await Shipment.count({ where: { status: 'IN_TRANSIT' } });
    const delivered = await Shipment.count({ where: { status: 'DELIVERED' } });
    
    return {
      activeShipments: inTransit,
      totalShipments: total,
      completedDeliveries: delivered,
      delayedShipments: 0 // Mock for now
    };
  }

  async confirmDelivery(id, userId) {
    const shipment = await this.getShipmentById(id);
    if (!shipment) throw new AppError('Shipment not found', 404);
    
    await shipment.update({ status: 'DELIVERED', isDelivered: true, actualArrival: new Date() });
    
    await logActivity(userId, 'CONFIRM_DELIVERY', 'Shipment', id, 'Delivery manually confirmed by manager');
    
    return shipment;
  }
}

module.exports = new ShipmentService();
