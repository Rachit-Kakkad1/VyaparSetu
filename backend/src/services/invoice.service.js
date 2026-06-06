const { Invoice, PurchaseOrder, Vendor, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const pdfService = require('./pdf.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const { logActivity } = require('../utils/logger');
const axios = require('axios');

class InvoiceService {
  async generateInvoice(poId, taxRate = 0.0) {
    const t = await sequelize.transaction();
    try {
      const po = await PurchaseOrder.findByPk(poId, { include: [{ model: Vendor, as: 'vendor' }] });
      if (!po) throw new AppError('Purchase Order not found', 404);

      const subtotal = po.totalAmount;
      const taxAmount = subtotal * taxRate;
      const grandTotal = parseFloat(subtotal) + parseFloat(taxAmount);

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-' + Date.now(),
        poId: po.id,
        vendorId: po.vendorId,
        subtotal,
        taxAmount,
        grandTotal,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days due date
      }, { transaction: t });

      await t.commit();

      // Async background tasks
      (async () => {
        try {
          const pdfUrl = await pdfService.generateInvoice(invoice);
          invoice.pdfUrl = pdfUrl;
          await invoice.save();
          
          const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
          const pdfBuffer = Buffer.from(response.data, 'utf-8');

          await emailService.sendInvoiceEmail(po.vendor, invoice, pdfBuffer, null, null);
          await notificationService.createNotification(po.generatedById, 'Invoice Generated', 'Invoice ' + invoice.invoiceNumber + ' created.', 'INVOICE_GENERATED', '/invoices/' + invoice.id);
        } catch (err) {
          console.error('Failed PDF/Email generation for Invoice:', err);
        }
      })();

      await logActivity(po.vendorId, 'GENERATE_INVOICE', 'Invoice', invoice.id, 'Generated Invoice for PO', null);

      return this.getInvoiceById(invoice.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getInvoiceById(id) {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }
}

module.exports = new InvoiceService();
