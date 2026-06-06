module.exports = (sequelize, DataTypes) => {
  const Quotation = sequelize.define('Quotation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfqId: { type: DataTypes.UUID, allowNull: false },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED'), defaultValue: 'DRAFT' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    deliveryTimeDays: { type: DataTypes.INTEGER },
    validUntil: { type: DataTypes.DATE },
    documents: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    remarks: { type: DataTypes.TEXT }
  }, {
    tableName: 'quotations',
    timestamps: true
  });

  Quotation.associate = function(models) {
    Quotation.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
    Quotation.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
    Quotation.hasMany(models.QuotationItem, { foreignKey: 'quotationId', as: 'items' });
  };

  return Quotation;
};
