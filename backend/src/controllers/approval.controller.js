const approvalService = require('../services/approval.service');
const ApiResponse = require('../utils/ApiResponse');

class ApprovalController {
  async initiateApproval(req, res, next) {
    try {
      const workflow = await approvalService.initiateApproval(req.body, req.user.id);
      ApiResponse.success(res, 'Approval workflow initiated', { workflow }, 201);
    } catch (error) {
      next(error);
    }
  }

  async processApproval(req, res, next) {
    try {
      const { id } = req.params; // this is the step id
      const { status, remarks } = req.body;
      const step = await approvalService.processApproval(id, req.user.id, status, remarks);
      ApiResponse.success(res, `Approval step marked as ${status}`, { step });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApprovalController();
