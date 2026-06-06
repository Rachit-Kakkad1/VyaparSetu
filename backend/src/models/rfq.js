module.exports = (sequelize, DataTypes) => {
  const Rfq = sequelize.define('Rfq', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfqNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'), defaultValue: 'DRAFT' },
    deadline: { type: DataTypes.DATE, allowNull: false },
    documents: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    createdBy: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'rfqs',
    timestamps: true
  });

  Rfq.associate = function(models) {
    Rfq.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Rfq.hasMany(models.RfqItem, { foreignKey: 'rfqId', as: 'items' });
    Rfq.hasMany(models.RfqVendor, { foreignKey: 'rfqId', as: 'assignedVendors' });
    Rfq.hasMany(models.Quotation, { foreignKey: 'rfqId', as: 'quotations' });
  };

  return Rfq;
};
