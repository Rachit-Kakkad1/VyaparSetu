module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define('ConversationParticipant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false, field: 'conversation_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    role: { type: DataTypes.ENUM('INITIATOR', 'PARTICIPANT'), defaultValue: 'PARTICIPANT' },
    joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'joined_at' }
  }, {
    tableName: 'conversation_participants',
    timestamps: false,
    underscored: true
  });

  ConversationParticipant.associate = function(models) {
    ConversationParticipant.belongsTo(models.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
    ConversationParticipant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ConversationParticipant;
};
