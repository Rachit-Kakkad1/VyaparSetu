const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Roles are required
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles;');
    const roleRows = roles[0];
    const getR = (n) => roleRows.find(r => r.name === n).id;

    const users = await queryInterface.sequelize.query('SELECT id, email FROM users;');
    const userRows = users[0];

    const officer = userRows.find(u => u.email === 'procurement@vyaparsetu.com');
    const manager = userRows.find(u => u.email === 'manager@vyaparsetu.com');
    const admin = userRows.find(u => u.email === 'admin@vyaparsetu.com');

    if (!officer || !manager || !admin) {
        throw new Error('Required seed users for Extra Dummy not found.');
    }

    const officerId = officer.id;
    const managerId = manager.id;
    const adminId = admin.id;
    
    // 1. Users
    const password = await bcrypt.hash('password123', 10);
    const dummyUsers = [
        { id: uuidv4(), firstName: 'Vikram', lastName: 'Malhotra', email: 'vikram.pro@dummy.com', password, roleId: getR('PROCUREMENT_OFFICER'), createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), firstName: 'Ananya', lastName: 'Singhania', email: 'ananya.mgr@dummy.com', password, roleId: getR('MANAGER'), createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), firstName: 'Rajesh', lastName: 'Khanna', email: 'rajesh.vendor@dummy.com', password, roleId: getR('VENDOR'), createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('users', dummyUsers, {});

    // 2. Vendors
    const vendors = [
      { id: uuidv4(), companyName: 'Bharat Petroleum', contactEmail: 'bpcl@govt.in', taxId: '27BPCL001', status: 'APPROVED', performanceScore: 4.2, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'Larsen & Toubro', contactEmail: 'tenders@lnt.com', taxId: 'GSTLNT888', status: 'APPROVED', performanceScore: 4.9, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'Siemens India', contactEmail: 'sales@siemens.co.in', taxId: 'GSTSIE111', status: 'PENDING', performanceScore: 4.5, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'UltraTech Cement', contactEmail: 'procure@ultratech.com', taxId: 'GSTUTC222', status: 'APPROVED', performanceScore: 4.7, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), companyName: 'Mahindra Logistics', contactEmail: 'dispatch@mahindra.com', taxId: 'GSTMHL444', status: 'APPROVED', performanceScore: 4.3, createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('vendors', vendors, {});

    // 3. RFQs
    const rfqs = [
      { id: uuidv4(), rfqNumber: 'RFQ-2026-N001', title: 'Power Grid Infrastructure Upgrade', description: 'Transformer and switchgear supply', status: 'PUBLISHED', deadline: new Date(Date.now() + 86400000 * 10), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqNumber: 'RFQ-2026-N002', title: 'Expressway Lighting Solutions', description: 'LED Lamp posts and solar controllers', status: 'PUBLISHED', deadline: new Date(Date.now() + 86400000 * 5), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqNumber: 'RFQ-2026-N003', title: 'Data Center HVAC Maintenance', description: 'Quarterly servicing of precision AC units', status: 'DRAFT', deadline: new Date(Date.now() + 86400000 * 20), createdBy: officerId, createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('rfqs', rfqs, {});

    // 4. Quotations
    const quoteId1 = uuidv4();
    const quotations = [
      { id: quoteId1, rfqId: rfqs[0].id, vendorId: vendors[1].id, status: 'SUBMITTED', totalAmount: 8500000, deliveryTimeDays: 30, remarks: 'Full turnkey installation included.', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqId: rfqs[0].id, vendorId: vendors[2].id, status: 'SUBMITTED', totalAmount: 7900000, deliveryTimeDays: 45, remarks: 'Best pricing for high-grade components.', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), rfqId: rfqs[1].id, vendorId: vendors[3].id, status: 'SUBMITTED', totalAmount: 1200000, deliveryTimeDays: 15, remarks: 'Ready for dispatch.', createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('quotations', quotations, {});

    // 5. POs
    const poId1 = uuidv4();
    await queryInterface.bulkInsert('purchase_orders', [{
        id: poId1,
        poNumber: 'PO-2026-IND-001',
        quotationId: quoteId1,
        vendorId: vendors[1].id,
        status: 'ISSUED',
        totalAmount: 8500000,
        generatedById: officerId,
        createdAt: new Date(),
        updatedAt: new Date()
    }]);

    // 6. Notifications
    await queryInterface.bulkInsert('notifications', [
        { id: uuidv4(), userId: managerId, title: 'New Quotation Alert', message: 'L&T submitted a bid for Power Grid Upgrade', type: 'INFO', isRead: false, link: '/rfqs', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), userId: managerId, title: 'Approval Required', message: 'RFQ-2026-N001 has 2 bids ready for decision', type: 'WARNING', isRead: false, link: '/approvals', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), userId: officerId, title: 'PO Released', message: 'PO-2026-IND-001 has been sent to L&T', type: 'SUCCESS', isRead: false, link: '/pos', createdAt: new Date(), updatedAt: new Date() },
    ]);

    // 7. Activity Logs
    const logData = [
        { id: uuidv4(), userId: officerId, action: 'CREATE_RFQ', entity: 'RFQ', description: 'Drafted Power Grid Infrastructure RFQ', createdAt: new Date(Date.now() - 3600000 * 24) },
        { id: uuidv4(), userId: adminId, action: 'VERIFY_VENDOR', entity: 'Vendor', description: 'Verified Bharat Petroleum credentials', createdAt: new Date(Date.now() - 3600000 * 12) },
        { id: uuidv4(), userId: managerId, action: 'LOGIN', entity: 'User', description: 'Manager portal accessed from Mumbai', createdAt: new Date() },
    ];
    await queryInterface.bulkInsert('activity_logs', logData, {});

    console.log('✅ Extra Dummy Data Injected');
  },
  down: async () => {}
};
