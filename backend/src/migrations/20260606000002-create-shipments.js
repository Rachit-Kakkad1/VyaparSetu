module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      shipmentNumber: { type: Sequelize.STRING, unique: true, allowNull: false },
      poId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'purchase_orders', key: 'id' }
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'vendors', key: 'id' }
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
        defaultValue: 'PENDING'
      },
      originLat: { type: Sequelize.FLOAT, allowNull: false },
      originLng: { type: Sequelize.FLOAT, allowNull: false },
      destinationLat: { type: Sequelize.FLOAT, allowNull: false },
      destinationLng: { type: Sequelize.FLOAT, allowNull: false },
      currentLat: { type: Sequelize.FLOAT },
      currentLng: { type: Sequelize.FLOAT },
      progressPercentage: { type: Sequelize.FLOAT, defaultValue: 0.0 },
      estimatedArrival: { type: Sequelize.DATE },
      actualArrival: { type: Sequelize.DATE },
      isDelivered: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('shipment_tracking_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      shipmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'shipments', key: 'id' }
      },
      latitude: { type: Sequelize.FLOAT, allowNull: false },
      longitude: { type: Sequelize.FLOAT, allowNull: false },
      timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipment_tracking_logs');
    await queryInterface.dropTable('shipments');
  }
};
