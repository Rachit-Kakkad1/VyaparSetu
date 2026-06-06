module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('shipments', 'routeGeometry', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'routePoints', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('shipments', 'routeGeometry');
    await queryInterface.removeColumn('shipments', 'routePoints');
  }
};
