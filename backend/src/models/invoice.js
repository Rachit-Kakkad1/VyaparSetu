module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoiceNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    poId: { type: DataTypes.UUID, allowNull: false },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'), defaultValue: 'PENDING' },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    grandTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    pdfUrl: { type: DataTypes.STRING },
    dueDate: { type: DataTypes.DATE }
  }, {
    tableName: 'invoices',
    timestamps: true
  });

  Invoice.associate = function(models) {
    Invoice.belongsTo(models.PurchaseOrder, { foreignKey: 'poId', as: 'purchaseOrder' });
    Invoice.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
  };

  return Invoice;
};
