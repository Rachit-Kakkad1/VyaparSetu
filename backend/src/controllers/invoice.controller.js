const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/ApiResponse');

class InvoiceController {
  async createInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.createManualInvoice(req.body, req.user.id);
      ApiResponse.success(res, 'Invoice created successfully', { invoice }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllInvoices(req, res, next) {
    try {
      const invoices = await invoiceService.getAllInvoices(req.query);
      ApiResponse.success(res, 'Invoices retrieved successfully', { invoices });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      ApiResponse.success(res, 'Invoice retrieved successfully', { invoice });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user.id);
      ApiResponse.success(res, 'Invoice updated successfully', { invoice });
    } catch (error) {
      next(error);
    }
  }

  async generatePdf(req, res, next) {
    try {
      const pdfUrl = await invoiceService.generatePdf(req.params.id, req.user.id);
      ApiResponse.success(res, 'Invoice PDF generated successfully', { pdfUrl });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
