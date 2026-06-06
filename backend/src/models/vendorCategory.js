module.exports = (sequelize, DataTypes) => {
  const VendorCategory = sequelize.define('VendorCategory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING }
  }, {
    tableName: 'vendor_categories',
    timestamps: true
  });

  VendorCategory.associate = function(models) {
    VendorCategory.hasMany(models.Vendor, { foreignKey: 'categoryId', as: 'vendors' });
  };

  return VendorCategory;
};
