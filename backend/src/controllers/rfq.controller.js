const rfqService = require('../services/rfq.service');
const ApiResponse = require('../utils/ApiResponse');

class RfqController {
  async createRfq(req, res, next) {
    try {
      const rfq = await rfqService.createRfq(req.body, req.user.id);
      ApiResponse.success(res, 'RFQ created successfully', { rfq }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getRfqById(req, res, next) {
    try {
      const rfq = await rfqService.getRfqById(req.params.id);
      ApiResponse.success(res, 'RFQ retrieved successfully', { rfq });
    } catch (error) {
      next(error);
    }
  }

  async getAllRfqs(req, res, next) {
    try {
      const rfqs = await rfqService.getAllRfqs();
      ApiResponse.success(res, 'RFQs retrieved successfully', { rfqs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RfqController();
