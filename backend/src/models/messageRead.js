module.exports = (sequelize, DataTypes) => {
  const MessageRead = sequelize.define('MessageRead', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    messageId: { type: DataTypes.UUID, allowNull: false, field: 'message_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'read_at' }
  }, {
    tableName: 'message_reads',
    timestamps: false,
    underscored: true
  });

  MessageRead.associate = function(models) {
    MessageRead.belongsTo(models.Message, { foreignKey: 'messageId', as: 'message' });
    MessageRead.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return MessageRead;
};
