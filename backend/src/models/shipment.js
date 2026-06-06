module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shipmentNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    poId: { type: DataTypes.UUID, allowNull: false },
    vendorId: { type: DataTypes.UUID, allowNull: false },
    status: { 
      type: DataTypes.ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'), 
      defaultValue: 'PENDING' 
    },
    originLat: { type: DataTypes.FLOAT, allowNull: false },
    originLng: { type: DataTypes.FLOAT, allowNull: false },
    destinationLat: { type: DataTypes.FLOAT, allowNull: false },
    destinationLng: { type: DataTypes.FLOAT, allowNull: false },
    currentLat: { type: DataTypes.FLOAT },
    currentLng: { type: DataTypes.FLOAT },
    progressPercentage: { type: DataTypes.FLOAT, defaultValue: 0.0 },
    estimatedArrival: { type: DataTypes.DATE },
    actualArrival: { type: DataTypes.DATE },
    isDelivered: { type: DataTypes.BOOLEAN, defaultValue: false },
    routeGeometry: { type: DataTypes.TEXT }, // Stores the encoded polyline or coordinates JSON
    routePoints: { type: DataTypes.JSONB, defaultValue: [] } // Stores the list of [lat, lng] for simulation
  }, {
    tableName: 'shipments',
    timestamps: true
  });

  Shipment.associate = function(models) {
    Shipment.belongsTo(models.PurchaseOrder, { foreignKey: 'poId', as: 'purchaseOrder' });
    Shipment.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'vendor' });
    Shipment.hasMany(models.ShipmentTrackingLog, { foreignKey: 'shipmentId', as: 'trackingLogs' });
  };

  return Shipment;
};
