const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles;');
    const roleRows = roles[0];
    const getR = (n) => roleRows.find(r => r.name === n).id;

    const password = await bcrypt.hash('password123', 10);

    const users = [
      { id: 'f4d9940d-ea88-4b78-bf99-2f24f52e1ae2', firstName: 'Admin', lastName: 'User', email: 'admin@vyaparsetu.com', password, roleId: getR('ADMIN'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '010e302c-a32d-47fc-bc4f-d01c1121761e', firstName: 'Rahul', lastName: 'Sharma', email: 'procurement@vyaparsetu.com', password, roleId: getR('PROCUREMENT_OFFICER'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '3ae9f5b6-d609-4f5e-9386-7d61391a619b', firstName: 'Priya', lastName: 'Patel', email: 'manager@vyaparsetu.com', password, roleId: getR('MANAGER'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '36c97b5b-cd67-47c6-b0e7-38efc0fdb441', firstName: 'Rachit', lastName: 'Kakkad', email: 'kakkadrachit1@gmail.com', password, roleId: getR('ADMIN'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'd29917db-b8cd-4d27-9da0-9240510746ad', firstName: 'Vendor', lastName: 'User', email: 'vendor_1780736465402@test.com', password, roleId: getR('VENDOR'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a6786f08-f30e-4c0e-9509-3131323b0651', firstName: 'Hacker', lastName: 'Vendor', email: 'malicious_1780737254251@audit.com', password, roleId: getR('VENDOR'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2c82f752-d13f-4bf0-b2c9-9605c6c1bf38', firstName: 'Tapan', lastName: 'Vachhani', email: 'vachhanitapan7@gmail.com', password, roleId: getR('VENDOR'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'd6ac8df5-f7ad-4853-9873-5b4d07416030', firstName: 'Global', lastName: 'Vendor', email: 'vendor@vyaparsetu.com', password, roleId: getR('VENDOR'), isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('users', null, {}); }
};
