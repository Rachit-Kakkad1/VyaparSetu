module.exports = (sequelize, DataTypes) => {
  const ApprovalStep = sequelize.define('ApprovalStep', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workflowId: { type: DataTypes.UUID, allowNull: false },
    approverId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
    remarks: { type: DataTypes.TEXT },
    stepOrder: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'approval_steps',
    timestamps: true
  });

  ApprovalStep.associate = function(models) {
    ApprovalStep.belongsTo(models.ApprovalWorkflow, { foreignKey: 'workflowId', as: 'workflow' });
    ApprovalStep.belongsTo(models.User, { foreignKey: 'approverId', as: 'approver' });
  };

  return ApprovalStep;
};
