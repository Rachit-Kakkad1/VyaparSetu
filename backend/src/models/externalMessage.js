module.exports = (sequelize, DataTypes) => {
  const ExternalMessage = sequelize.define('ExternalMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    messageId: { type: DataTypes.STRING, unique: true }, // External email ID
    sender: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING },
    bodyText: { type: DataTypes.TEXT },
    bodyHtml: { type: DataTypes.TEXT },
    rfqId: { type: DataTypes.UUID },
    receivedAt: { type: DataTypes.DATE },
    attachments: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }
  }, {
    tableName: 'external_messages',
    timestamps: true
  });

  ExternalMessage.associate = function(models) {
    ExternalMessage.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
  };

  return ExternalMessage;
};
