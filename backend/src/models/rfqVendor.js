module.exports = (sequelize, DataTypes) => {
  const RfqVendor = sequelize.define('RfqVendor', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfqId: { type: DataTypes.UUID, allowNull: false },
    vendorId: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'rfq_vendors',
    timestamps: true
  });

  RfqVendor.associate = function(models) {
    RfqVendor.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
    RfqVendor.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
  };

  return RfqVendor;
};
