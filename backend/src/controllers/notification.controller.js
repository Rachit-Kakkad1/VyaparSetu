const { Notification } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      ApiResponse.success(res, 'Notifications retrieved successfully', { notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
      if (notification) {
        notification.isRead = true;
        await notification.save();
      }
      ApiResponse.success(res, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
      ApiResponse.success(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await Notification.destroy({ where: { id: req.params.id, userId: req.user.id } });
      ApiResponse.success(res, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
