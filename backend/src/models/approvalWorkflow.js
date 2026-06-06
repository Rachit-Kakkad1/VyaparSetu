module.exports = (sequelize, DataTypes) => {
  const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfqId: { type: DataTypes.UUID },
    quotationId: { type: DataTypes.UUID },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
    initiatorId: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'approval_workflows',
    timestamps: true
  });

  ApprovalWorkflow.associate = function(models) {
    ApprovalWorkflow.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
    ApprovalWorkflow.belongsTo(models.Quotation, { foreignKey: 'quotationId', as: 'quotation' });
    ApprovalWorkflow.belongsTo(models.User, { foreignKey: 'initiatorId', as: 'initiator' });
    ApprovalWorkflow.hasMany(models.ApprovalStep, { foreignKey: 'workflowId', as: 'steps' });
  };

  return ApprovalWorkflow;
};
