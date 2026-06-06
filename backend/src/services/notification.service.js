const { Notification } = require('../models');
const { getIo } = require('../sockets');

class NotificationService {
  async createNotification(userId, title, message, type, link) {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });

    try {
      const io = getIo();
      io.to(userId).emit('new_notification', notification);
    } catch (error) {
      console.error('Socket not initialized or user not connected');
    }

    return notification;
  }
}

module.exports = new NotificationService();
