const { Rfq, RfqItem, RfqVendor, Vendor, User, Quotation, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');

class RfqService {
  async createRfq(data, userId) {
    const t = await sequelize.transaction();
    try {
      const { items, vendorIds, ...rfqData } = data;
      
      const rfq = await Rfq.create({
        ...rfqData,
        rfqNumber: 'RFQ-' + Date.now(), 
        createdBy: userId
      }, { transaction: t });

      if (items && items.length > 0) {
        const itemData = items.map(item => ({ ...item, rfqId: rfq.id }));
        await RfqItem.bulkCreate(itemData, { transaction: t });
      }

      if (vendorIds && vendorIds.length > 0) {
        const vendorData = vendorIds.map(vendorId => ({ vendorId, rfqId: rfq.id }));
        await RfqVendor.bulkCreate(vendorData, { transaction: t });
      }

      await t.commit();
      
      const createdRfq = await this.getRfqById(rfq.id);
      
      // Async: Send emails to assigned vendors
      if (vendorIds && vendorIds.length > 0) {
        (async () => {
          for (const rv of createdRfq.assignedVendors) {
            try {
              await emailService.sendRFQAssignedEmail(rv.vendor, createdRfq, userId, null);
              await notificationService.createNotification(rv.vendorId, 'New RFQ Assigned', 'You have been assigned to RFQ ' + createdRfq.rfqNumber, 'RFQ_ASSIGNED', '/rfqs/' + createdRfq.id);
            } catch (err) {
              console.error('Failed to notify vendor:', rv.vendorId, err.message);
            }
          }
        })();
      }

      await logActivity(userId, 'CREATE_RFQ', 'RFQ', rfq.id, 'Created RFQ ' + rfq.rfqNumber, null);

      return createdRfq;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getRfqById(id) {
    const rfq = await Rfq.findByPk(id, {
      include: [
        { model: RfqItem, as: 'items' },
        { model: RfqVendor, as: 'assignedVendors', include: [{ model: Vendor, as: 'vendor' }] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    if (!rfq) throw new AppError('RFQ not found', 404);
    return rfq;
  }

  async getAllRfqs() {
    return await Rfq.findAll({
      include: [
        { model: RfqItem, as: 'items' },
        { 
            model: Quotation, 
            as: 'quotations', 
            include: [{ model: Vendor, as: 'vendor' }] 
        },
        { 
            model: RfqVendor, 
            as: 'assignedVendors', 
            include: [{ model: Vendor, as: 'vendor' }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new RfqService();
