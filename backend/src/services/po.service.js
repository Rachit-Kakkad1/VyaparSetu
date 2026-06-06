const { PurchaseOrder, Quotation, Vendor, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const pdfService = require('./pdf.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');

class PurchaseOrderService {
  async generatePO(quotationId, userId) {
    const t = await sequelize.transaction();
    try {
      const quotation = await Quotation.findByPk(quotationId, { include: [{ model: Vendor, as: 'vendor' }] });
      if (!quotation) throw new AppError('Quotation not found', 404);
      if (quotation.status !== 'ACCEPTED') {
        throw new AppError('Quotation must be accepted to generate PO', 400);
      }

      const po = await PurchaseOrder.create({
        poNumber: `PO-${Date.now()}`,
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
        totalAmount: quotation.totalAmount,
        generatedById: userId,
        status: 'ISSUED'
      }, { transaction: t });

      await t.commit();
      
      // Async background tasks
      (async () => {
        try {
          const pdfUrl = await pdfService.generatePO(po);
          po.pdfUrl = pdfUrl;
          await po.save();
          await emailService.sendPOEmail(quotation.vendor.contactEmail, po);
          await notificationService.createNotification(quotation.vendorId, 'PO Generated', `Purchase Order ${po.poNumber} generated.`, 'PO_ISSUED', `/pos/${po.id}`);
        } catch (err) {
          console.error('Failed PDF/Email generation for PO:', err);
        }
      })();

      await logActivity(userId, 'GENERATE_PO', 'PurchaseOrder', po.id, 'Generated PO for quotation');

      return this.getPOById(po.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getPOById(id) {
    const po = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Quotation, as: 'quotation' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    if (!po) throw new AppError('PO not found', 404);
    return po;
  }
}

module.exports = new PurchaseOrderService();
