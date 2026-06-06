module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    ipAddress: { type: DataTypes.STRING }
  }, {
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false // Logs are append-only usually
  });

  ActivityLog.associate = function(models) {
    ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ActivityLog;
};
