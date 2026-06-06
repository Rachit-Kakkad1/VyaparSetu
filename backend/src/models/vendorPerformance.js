module.exports = (sequelize, DataTypes) => {
  const VendorPerformance = sequelize.define('VendorPerformance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    metricType: { type: DataTypes.STRING, allowNull: false }, // e.g., 'ON_TIME_DELIVERY', 'QUALITY'
    score: { type: DataTypes.FLOAT, allowNull: false },
    evaluationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    remarks: { type: DataTypes.TEXT }
  }, {
    tableName: 'vendor_performance',
    timestamps: true
  });

  VendorPerformance.associate = function(models) {
    VendorPerformance.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
  };

  return VendorPerformance;
};
