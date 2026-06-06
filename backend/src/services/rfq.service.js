const { Rfq, RfqItem, RfqVendor, Vendor, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');

class RfqService {
  async createRfq(data, userId) {
    const t = await sequelize.transaction();
    try {
      const { items, vendorIds, ...rfqData } = data;
      
      const rfq = await Rfq.create({
        ...rfqData,
        rfqNumber: `RFQ-${Date.now()}`, // Simplified number generation
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
      return this.getRfqById(rfq.id);
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
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new RfqService();
