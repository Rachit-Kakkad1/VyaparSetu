module.exports = (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoiceId: { type: DataTypes.UUID, allowNull: false },
    itemDescription: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    tableName: 'invoice_items',
    timestamps: true
  });

  InvoiceItem.associate = function(models) {
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
  };

  return InvoiceItem;
};
