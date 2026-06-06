module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    registrationNumber: { type: DataTypes.STRING, unique: true },
    taxId: { type: DataTypes.STRING },
    contactEmail: { type: DataTypes.STRING, allowNull: false },
    contactPhone: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    categoryId: { type: DataTypes.UUID },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'BLACKLISTED'), defaultValue: 'PENDING' },
    performanceScore: { type: DataTypes.FLOAT, defaultValue: 0.0 }
  }, {
    tableName: 'vendors',
    timestamps: true
  });

  Vendor.associate = function(models) {
    Vendor.belongsTo(models.VendorCategory, { foreignKey: 'categoryId', as: 'category' });
    Vendor.hasMany(models.VendorUser, { foreignKey: 'vendorId', as: 'users' });
    // Assuming other relations like RFQ assignments will be handled via junctions
  };

  return Vendor;
};
