const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles;'
    );
    
    const roleRows = roles[0];
    const getRoleId = (name) => roleRows.find(r => r.name === name).id;

    const password = await bcrypt.hash('password123', 10);

    const users = [
      {
        id: uuidv4(),
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@vyaparsetu.com',
        password: password,
        roleId: getRoleId('ADMIN'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Rachit',
        lastName: 'Kakkad',
        email: 'kakkadrachit1@gmail.com',
        password: password,
        roleId: getRoleId('ADMIN'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Tapan',
        lastName: 'Vachhani',
        email: 'vachhanitapan7@gmail.com',
        password: password,
        roleId: getRoleId('VENDOR'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Procurement',
        lastName: 'Officer',
        email: 'officer@vyaparsetu.com',
        password: password,
        roleId: getRoleId('PROCUREMENT_OFFICER'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Procurement',
        lastName: 'Manager',
        email: 'manager@vyaparsetu.com',
        password: password,
        roleId: getRoleId('MANAGER'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Global',
        lastName: 'Vendor',
        email: 'vendor@vyaparsetu.com',
        password: password,
        roleId: getRoleId('VENDOR'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
