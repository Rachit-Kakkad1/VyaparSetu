module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false, field: 'conversation_id' },
    senderId: { type: DataTypes.UUID, allowNull: false, field: 'sender_id' },
    message: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: 'messages',
    timestamps: true,
    underscored: true
  });

  Message.associate = function(models) {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    Message.hasMany(models.MessageRead, { foreignKey: 'messageId', as: 'reads' });
  };

  return Message;
};
