const { EmailLog, User, sequelize } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const { Op } = require('sequelize');

class EmailLogController {
  async getAllLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, status, template, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (template) where.templateName = template;
      if (search) {
        where[Op.or] = [
          { recipientEmail: { [Op.iLike]: '%' + search + '%' } },
          { subject: { [Op.iLike]: '%' + search + '%' } }
        ];
      }

      const logs = await EmailLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      });

      ApiResponse.success(res, 'Email logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  }

  async getLogById(req, res, next) {
    try {
      const log = await EmailLog.findByPk(req.params.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      });
      if (!log) return ApiResponse.error(res, 'Log not found', 404);
      ApiResponse.success(res, 'Email log retrieved successfully', { log });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const totalSent = await EmailLog.count({ where: { status: 'SENT' } });
      const totalFailed = await EmailLog.count({ where: { status: 'FAILED' } });
      const successRate = totalSent > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sentToday = await EmailLog.count({ 
        where: { 
          status: 'SENT',
          sentAt: { [Op.gte]: today }
        } 
      });

      const templateUsage = await EmailLog.findAll({
        attributes: ['templateName', [sequelize.fn('count', sequelize.col('id')), 'count']],
        group: ['templateName'],
        order: [[sequelize.literal('count'), 'DESC']]
      });

      ApiResponse.success(res, 'Email statistics retrieved successfully', {
        totalSent,
        totalFailed,
        successRate: successRate.toFixed(2) + '%',
        sentToday,
        templateUsage
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailLogController();
