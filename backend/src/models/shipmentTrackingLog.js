module.exports = (sequelize, DataTypes) => {
  const ShipmentTrackingLog = sequelize.define('ShipmentTrackingLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shipmentId: { type: DataTypes.UUID, allowNull: false },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'shipment_tracking_logs',
    timestamps: true,
    updatedAt: false
  });

  ShipmentTrackingLog.associate = function(models) {
    ShipmentTrackingLog.belongsTo(models.Shipment, { foreignKey: 'shipmentId', as: 'shipment' });
  };

  return ShipmentTrackingLog;
};
