const { ActivityLog } = require('../models');

const logActivity = async (userId, action, entity, entityId, description, ipAddress) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entity,
      entityId,
      description,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
