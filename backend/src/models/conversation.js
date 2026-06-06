module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM('RFQ_NEGOTIATION', 'DIRECT_SUPPORT', 'GENERAL'), allowNull: false },
    referenceId: { type: DataTypes.UUID, field: 'reference_id' }, // RFQ ID or other entity
    status: { type: DataTypes.ENUM('ACTIVE', 'CLOSED', 'ARCHIVED'), defaultValue: 'ACTIVE' }
  }, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true
  });

  Conversation.associate = function(models) {
    Conversation.hasMany(models.ConversationParticipant, { foreignKey: 'conversationId', as: 'participants' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversationId', as: 'messages' });
  };

  return Conversation;
};
