const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 0. Clear existing data to avoid conflicts if needed, but here we add "dummy" data
    // Roles should already be there from previous migrations/seeders
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles;');
    const roleRows = roles[0];
    const getR = (n) => roleRows.find(r => r.name === n).id;

    // 1. Users
    const password = await bcrypt.hash('password123', 10);
    const users = [
      { id: uuidv4(), firstName: 'Dummy', lastName: 'Officer', email: 'officer@dummy.com', password, roleId: getR('PROCUREMENT_OFFICER'), createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), firstName: 'Dummy', lastName: 'Manager', email: 'manager@dummy.com', password, roleId: getR('MANAGER'), createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), firstName: 'Dummy', lastName: 'Vendor', email: 'vendor@dummy.com', password, roleId: getR('VENDOR'), createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('users', users, {});

    const officerId = users[0].id;
    const vendorUserId = users[2].id;

    // 2. Vendors
    const vendors = [
      { id: uuidv4(), companyName: 'Reliance Industries', contactEmail: 'reliance@dummy.com', taxId: '27AAACR1234F1Z1', status: 'APPROVED', performanceScore: 4.5, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'Tata Steel', contactEmail: 'tata@dummy.com', taxId: '08TATA4567L1Z2', status: 'APPROVED', performanceScore: 4.9, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'Adani Group', contactEmail: 'adani@dummy.com', taxId: '24ADANI7890X1Z3', status: 'PENDING', performanceScore: 3.8, createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('vendors', vendors, {});
    
    // Link one vendor to the dummy vendor user
    await queryInterface.bulkInsert('vendor_users', [{
        id: uuidv4(), vendorId: vendors[0].id, userId: vendorUserId, createdAt: new Date(), updatedAt: new Date()
    }]);

    // 3. RFQs
    const rfqs = [
      { id: uuidv4(), rfqNumber: 'RFQ-2026-X1', title: 'Bulk Supply of Concrete', description: '5000 cubic meters of M35 grade concrete', status: 'PUBLISHED', deadline: new Date(Date.now() + 86400000 * 5), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqNumber: 'RFQ-2026-X2', title: 'Structural Steel Beams', description: 'ASTM A36 standard I-beams', status: 'PUBLISHED', deadline: new Date(Date.now() + 86400000 * 3), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqNumber: 'RFQ-2026-X3', title: 'Solar Panel Installation', description: 'Installation of 1MW solar array', status: 'DRAFT', deadline: new Date(Date.now() + 86400000 * 15), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('rfqs', rfqs, {});

    // 4. Quotations
    const quotations = [
      { id: uuidv4(), rfqId: rfqs[0].id, vendorId: vendors[0].id, status: 'SUBMITTED', totalAmount: 1500000, deliveryTimeDays: 7, remarks: 'Immediate availability.', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqId: rfqs[0].id, vendorId: vendors[1].id, status: 'SUBMITTED', totalAmount: 1450000, deliveryTimeDays: 10, remarks: 'Bulk discount applied.', createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('quotations', quotations, {});

    // 5. Activity Logs
    const logs = [
      { id: uuidv4(), userId: officerId, action: 'CREATE_RFQ', entity: 'RFQ', entityId: rfqs[0].id, description: 'Created RFQ for Concrete', ipAddress: '127.0.0.1', createdAt: new Date() },
      { id: uuidv4(), userId: vendorUserId, action: 'SUBMIT_QUOTE', entity: 'Quotation', entityId: quotations[0].id, description: 'Submitted quote for Concrete', ipAddress: '127.0.0.1', createdAt: new Date() },
    ];
    await queryInterface.bulkInsert('activity_logs', logs, {});

    // 6. Shipments
    const shipments = [
      { id: uuidv4(), shipmentNumber: 'SHP-DUMMY-1', poId: uuidv4(), vendorId: vendors[0].id, status: 'IN_TRANSIT', originLat: 28.6139, originLng: 77.2090, destinationLat: 19.0760, destinationLng: 72.8777, currentLat: 23.000, currentLng: 75.000, progressPercentage: 55, createdAt: new Date(), updatedAt: new Date() }
    ];
    // Note: poId should strictly exist but for dummy data we might skip FK check if not enforced or just create a PO
    // Let's create one PO to be safe
    const poId = uuidv4();
    await queryInterface.bulkInsert('purchase_orders', [{
        id: poId,
        poNumber: 'PO-DUMMY-1',
        quotationId: quotations[0].id,
        vendorId: vendors[0].id,
        status: 'ISSUED',
        totalAmount: 1500000,
        generatedById: getR('MANAGER') ? officerId : officerId, // Just use someone
        createdAt: new Date(),
        updatedAt: new Date()
    }]);
    
    shipments[0].poId = poId;
    await queryInterface.bulkInsert('shipments', shipments, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Clear all
  }
};
