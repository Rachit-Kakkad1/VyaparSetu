module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define('EmailLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    recipientEmail: { type: DataTypes.STRING, allowNull: false },
    recipientRole: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING, allowNull: false },
    templateName: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' },
    messageId: { type: DataTypes.STRING },
    entityType: { type: DataTypes.STRING }, // e.g., 'RFQ', 'PO'
    entityId: { type: DataTypes.UUID },
    sentBy: { type: DataTypes.UUID }, // User ID who triggered it
    errorMessage: { type: DataTypes.TEXT },
    ipAddress: { type: DataTypes.STRING },
    sentAt: { type: DataTypes.DATE }
  }, {
    tableName: 'email_logs',
    timestamps: true
  });

  EmailLog.associate = function(models) {
    EmailLog.belongsTo(models.User, { foreignKey: 'sentBy', as: 'sender' });
  };

  return EmailLog;
};
