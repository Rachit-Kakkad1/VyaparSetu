const { Quotation, QuotationItem, Rfq, Vendor, sequelize } = require('../models');
const AppError = require('../utils/AppError');

class QuotationService {
  async submitQuotation(data, vendorId) {
    const t = await sequelize.transaction();
    try {
      const { rfqId, items, deliveryTimeDays, validUntil, documents, remarks } = data;
      
      const rfq = await Rfq.findByPk(rfqId);
      if (!rfq) throw new AppError('RFQ not found', 404);

      let totalAmount = 0;
      const quotation = await Quotation.create({
        rfqId,
        vendorId,
        deliveryTimeDays,
        validUntil,
        documents,
        remarks,
        status: 'SUBMITTED'
      }, { transaction: t });

      if (items && items.length > 0) {
        const itemData = items.map(item => {
          const totalPrice = item.unitPrice * item.quantity; // quantity should ideally be verified against rfqItem
          totalAmount += totalPrice;
          return {
            quotationId: quotation.id,
            rfqItemId: item.rfqItemId,
            unitPrice: item.unitPrice,
            totalPrice: totalPrice,
            remarks: item.remarks
          };
        });
        await QuotationItem.bulkCreate(itemData, { transaction: t });
      }

      quotation.totalAmount = totalAmount;
      await quotation.save({ transaction: t });

      await t.commit();
      return this.getQuotationById(quotation.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getQuotationById(id) {
    const quotation = await Quotation.findByPk(id, {
      include: [
        { model: QuotationItem, as: 'items' },
        { model: Rfq, as: 'rfq' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    if (!quotation) throw new AppError('Quotation not found', 404);
    return quotation;
  }

  async getQuotationsByRfq(rfqId) {
    return await Quotation.findAll({
      where: { rfqId },
      include: [
        { model: Vendor, as: 'vendor' }
      ],
      order: [['totalAmount', 'ASC']] // Simple comparison logic (lowest price first)
    });
  }
}

module.exports = new QuotationService();
