const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/ApiResponse');

class InvoiceController {
  async generateInvoice(req, res, next) {
    try {
      const { poId, taxRate } = req.body;
      const invoice = await invoiceService.generateInvoice(poId, taxRate);
      ApiResponse.success(res, 'Invoice generated successfully', { invoice }, 201);
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
}

module.exports = new InvoiceController();
