const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { id: uuidv4(), name: 'ADMIN', description: 'System Administrator', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'PROCUREMENT_OFFICER', description: 'Procurement Officer', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'MANAGER', description: 'Procurement Manager', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'VENDOR', description: 'External Vendor', createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('roles', roles, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
