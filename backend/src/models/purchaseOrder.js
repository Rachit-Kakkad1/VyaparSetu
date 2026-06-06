module.exports = (sequelize, DataTypes) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    poNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    quotationId: { type: DataTypes.UUID, allowNull: false },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('DRAFT', 'ISSUED', 'ACCEPTED', 'DELIVERED', 'CLOSED'), defaultValue: 'DRAFT' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    pdfUrl: { type: DataTypes.STRING },
    generatedById: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'purchase_orders',
    timestamps: true
  });

  PurchaseOrder.associate = function(models) {
    PurchaseOrder.belongsTo(models.Quotation, { foreignKey: 'quotationId', as: 'quotation' });
    PurchaseOrder.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
    PurchaseOrder.belongsTo(models.User, { foreignKey: 'generatedById', as: 'generator' });
    PurchaseOrder.hasMany(models.Invoice, { foreignKey: 'poId', as: 'invoices' });
  };

  return PurchaseOrder;
};
