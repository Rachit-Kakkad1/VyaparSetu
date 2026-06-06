const { ActivityLog, User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

class ActivityLogController {
  async getAllLogs(req, res, next) {
    try {
      const logs = await ActivityLog.findAll({
        include: [{ model: User, as: 'user', attributes: ['email', 'firstName', 'lastName'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
      ApiResponse.success(res, 'Activity logs retrieved successfully', { logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityLogController();
