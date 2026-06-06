const quotationService = require('../services/quotation.service');
const ApiResponse = require('../utils/ApiResponse');

class QuotationController {
  async submitQuotation(req, res, next) {
    try {
      // In a real scenario, map req.user to vendorId or get it from req.body
      const vendorId = req.body.vendorId; // Simplification
      const quotation = await quotationService.submitQuotation(req.body, vendorId);
      ApiResponse.success(res, 'Quotation submitted successfully', { quotation }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getQuotationById(req, res, next) {
    try {
      const quotation = await quotationService.getQuotationById(req.params.id);
      ApiResponse.success(res, 'Quotation retrieved successfully', { quotation });
    } catch (error) {
      next(error);
    }
  }

  async getQuotationsByRfq(req, res, next) {
    try {
      const quotations = await quotationService.getQuotationsByRfq(req.params.rfqId);
      ApiResponse.success(res, 'Quotations retrieved successfully', { quotations });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuotationController();
