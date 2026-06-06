module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoiceNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    invoiceType: { type: DataTypes.ENUM('STANDARD', 'GST', 'PROFORMA'), defaultValue: 'STANDARD' },
    invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dueDate: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'), defaultValue: 'PENDING' },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    poId: { type: DataTypes.UUID },
    rfqId: { type: DataTypes.UUID },
    quotationId: { type: DataTypes.UUID },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    additionalCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    grandTotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    paymentTerms: { type: DataTypes.TEXT },
    remarks: { type: DataTypes.TEXT },
    bankDetails: { type: DataTypes.TEXT },
    authorizedSignatory: { type: DataTypes.STRING },
    pdfUrl: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.UUID }
  }, {
    tableName: 'invoices',
    timestamps: true
  });

  Invoice.associate = function(models) {
    Invoice.belongsTo(models.PurchaseOrder, { foreignKey: 'poId', as: 'purchaseOrder' });
    Invoice.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
    Invoice.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
    Invoice.belongsTo(models.Quotation, { foreignKey: 'quotationId', as: 'quotation' });
    Invoice.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
  };

  return Invoice;
};
