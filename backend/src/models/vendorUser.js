module.exports = (sequelize, DataTypes) => {
  const VendorUser = sequelize.define('VendorUser', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'vendor_users',
    timestamps: true
  });

  VendorUser.associate = function(models) {
    VendorUser.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
    VendorUser.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return VendorUser;
};
