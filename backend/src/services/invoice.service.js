const { Invoice, InvoiceItem, PurchaseOrder, Vendor, Rfq, Quotation, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const pdfService = require('./pdf.service');
const { logActivity } = require('../utils/logger');

class InvoiceService {
  async createManualInvoice(data, userId) {
    const t = await sequelize.transaction();
    try {
      const { items, ...invoiceData } = data;

      if (!items || items.length === 0) {
        throw new AppError('At least one invoice item is required', 400);
      }

      // Server-side calculations
      let subtotal = 0;
      const itemRecords = items.map(item => {
        const amount = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        subtotal += amount;
        return {
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: amount
        };
      });

      const taxAmount = parseFloat(invoiceData.taxAmount || 0);
      const additionalCharges = parseFloat(invoiceData.additionalCharges || 0);
      const discountAmount = parseFloat(invoiceData.discountAmount || 0);
      const grandTotal = (subtotal + taxAmount + additionalCharges) - discountAmount;

      const invoice = await Invoice.create({
        ...invoiceData,
        subtotal,
        grandTotal,
        createdBy: userId,
        status: 'PENDING'
      }, { transaction: t });

      // Create Items
      const finalItems = itemRecords.map(item => ({ ...item, invoiceId: invoice.id }));
      await InvoiceItem.bulkCreate(finalItems, { transaction: t });

      await t.commit();

      await logActivity(userId, 'INVOICE_CREATED', 'Invoice', invoice.id, 'Manually created invoice ' + invoice.invoiceNumber);

      return this.getInvoiceById(invoice.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getInvoiceById(id) {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: InvoiceItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: Vendor, as: 'vendor' },
        { model: Rfq, as: 'rfq' },
        { model: Quotation, as: 'quotation' }
      ]
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  async updateInvoice(id, data, userId) {
    const invoice = await this.getInvoiceById(id);
    const t = await sequelize.transaction();
    try {
      const { items, ...invoiceData } = data;

      if (items) {
        // Recalculate if items provided
        let subtotal = 0;
        await InvoiceItem.destroy({ where: { invoiceId: id }, transaction: t });
        
        const finalItems = items.map(item => {
          const amount = parseFloat(item.quantity) * parseFloat(item.unitPrice);
          subtotal += amount;
          return {
            ...item,
            amount,
            invoiceId: id
          };
        });
        await InvoiceItem.bulkCreate(finalItems, { transaction: t });
        
        invoiceData.subtotal = subtotal;
        const tax = parseFloat(invoiceData.taxAmount || invoice.taxAmount);
        const add = parseFloat(invoiceData.additionalCharges || invoice.additionalCharges);
        const disc = parseFloat(invoiceData.discountAmount || invoice.discountAmount);
        invoiceData.grandTotal = (subtotal + tax + add) - disc;
      }

      await invoice.update(invoiceData, { transaction: t });
      await t.commit();

      await logActivity(userId, 'INVOICE_UPDATED', 'Invoice', id, 'Updated invoice ' + invoice.invoiceNumber);
      return this.getInvoiceById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllInvoices(query) {
    return await Invoice.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Vendor, as: 'vendor' }]
    });
  }

  async generatePdf(id, userId) {
    const invoice = await this.getInvoiceById(id);
    const pdfUrl = await pdfService.generateInvoice(invoice);
    await invoice.update({ pdfUrl });
    
    await logActivity(userId, 'INVOICE_PDF_GENERATED', 'Invoice', id, 'Generated PDF for invoice ' + invoice.invoiceNumber);
    return pdfUrl;
  }
}

module.exports = new InvoiceService();
