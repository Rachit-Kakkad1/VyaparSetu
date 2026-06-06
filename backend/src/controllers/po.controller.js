const poService = require('../services/po.service');
const ApiResponse = require('../utils/ApiResponse');

class PurchaseOrderController {
  async generatePO(req, res, next) {
    try {
      const { quotationId } = req.body;
      const po = await poService.generatePO(quotationId, req.user.id);
      ApiResponse.success(res, 'Purchase Order generated successfully', { po }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getPOById(req, res, next) {
    try {
      const po = await poService.getPOById(req.params.id);
      ApiResponse.success(res, 'Purchase Order retrieved successfully', { po });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PurchaseOrderController();
