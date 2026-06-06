module.exports = (sequelize, DataTypes) => {
  const QuotationItem = sequelize.define('QuotationItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    quotationId: { type: DataTypes.UUID, allowNull: false },
    rfqItemId: { type: DataTypes.UUID, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    remarks: { type: DataTypes.STRING }
  }, {
    tableName: 'quotation_items',
    timestamps: true
  });

  QuotationItem.associate = function(models) {
    QuotationItem.belongsTo(models.Quotation, { foreignKey: 'quotationId', as: 'quotation' });
    QuotationItem.belongsTo(models.RfqItem, { foreignKey: 'rfqItemId', as: 'rfqItem' });
  };

  return QuotationItem;
};
