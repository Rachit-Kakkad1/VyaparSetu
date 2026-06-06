module.exports = (sequelize, DataTypes) => {
  const RfqItem = sequelize.define('RfqItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfqId: { type: DataTypes.UUID, allowNull: false },
    itemName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    uom: { type: DataTypes.STRING, allowNull: false } // Unit of Measure
  }, {
    tableName: 'rfq_items',
    timestamps: true
  });

  RfqItem.associate = function(models) {
    RfqItem.belongsTo(models.Rfq, { foreignKey: 'rfqId', as: 'rfq' });
  };

  return RfqItem;
};
