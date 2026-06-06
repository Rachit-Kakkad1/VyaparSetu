const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id, email FROM users;');
    const userRows = users[0];

    const officer = userRows.find(u => u.email === 'procurement@vyaparsetu.com');
    const manager = userRows.find(u => u.email === 'manager@vyaparsetu.com');
    const admin = userRows.find(u => u.email === 'admin@vyaparsetu.com');

    if (!officer || !manager || !admin) {
        throw new Error('Required seed users for Mega Seeder not found.');
    }

    const officerId = officer.id;
    const managerId = manager.id;
    const adminId = admin.id;

    // 1. More Vendors
    const vendorData = [];
    const companies = ['BuildMaster Pro', 'Steel India', 'TechSource Solutions', 'EcoFuel Energy', 'LogiTrans India', 'Precision Gears Ltd', 'Global Chemicals', 'Cement Corp'];
    for(let i=0; i<companies.length; i++) {
        vendorData.push({
            id: uuidv4(),
            companyName: companies[i] + ' ' + Math.floor(Math.random() * 100),
            registrationNumber: 'REG' + Math.floor(Math.random() * 10000000),
            taxId: 'GSTIN' + Math.floor(Math.random() * 10000000),
            contactEmail: 'contact' + i + '@' + companies[i].toLowerCase().replace(/ /g, '') + '.com',
            contactPhone: '+91 98' + Math.floor(Math.random() * 100000000),
            address: 'Industrial Plot ' + (i+1) + ', Phase II, City ' + (i % 3),
            status: i % 4 === 0 ? 'PENDING' : 'APPROVED',
            performanceScore: (3.5 + Math.random() * 1.5).toFixed(1),
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    await queryInterface.bulkInsert('vendors', vendorData, {});

    // 2. More RFQs
    const rfqData = [];
    const titles = ['Procurement of Office Furniture', 'Annual Maintenance Contract - Servers', 'Supply of Raw Iron Ore', 'Workforce Safety Equipment', 'Canteen Catering Services', 'High-Speed Internet Installation'];
    for(let i=0; i<titles.length; i++) {
        rfqData.push({
            id: uuidv4(),
            rfqNumber: 'RFQ-2026-B' + (i+100) + '-' + Math.floor(Math.random() * 1000),
            title: titles[i],
            description: 'Comprehensive requirement for ' + titles[i],
            status: i < 3 ? 'PUBLISHED' : 'CLOSED',
            deadline: new Date(Date.now() + 86400000 * (i + 2)),
            createdBy: officerId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    await queryInterface.bulkInsert('rfqs', rfqData, {});

    // 3. Quotations for these RFQs
    const quoteData = [];
    for(let i=0; i<rfqData.length; i++) { 
        const rfq = rfqData[i];
        for(let j=0; j<2; j++) { 
            const vendor = vendorData[Math.floor(Math.random() * vendorData.length)];
            quoteData.push({
                id: uuidv4(),
                rfqId: rfq.id,
                vendorId: vendor.id,
                status: 'SUBMITTED',
                totalAmount: 50000 + (Math.random() * 500000),
                deliveryTimeDays: 5 + Math.floor(Math.random() * 15),
                remarks: 'Standard quotation as per specifications.',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    await queryInterface.bulkInsert('quotations', quoteData, {});

    // 4. Activity Logs
    const logData = [];
    const actions = ['LOGIN', 'CREATE_RFQ', 'GENERATE_PO', 'UPDATE_VENDOR', 'APPROVE_STEP'];
    for(let i=0; i<20; i++) {
        logData.push({
            id: uuidv4(),
            userId: i % 2 === 0 ? officerId : managerId,
            action: actions[i % actions.length],
            entity: 'System',
            description: 'Action performed on ' + new Date().toLocaleDateString(),
            ipAddress: '192.168.1.' + (100 + i),
            createdAt: new Date(Date.now() - (i * 3600000))
        });
    }
    await queryInterface.bulkInsert('activity_logs', logData, {});

    // 5. POs
    const poData = [];
    for(let i=0; i<3; i++) {
        const quote = quoteData[i];
        poData.push({
            id: uuidv4(),
            poNumber: 'PO-2026-X' + i + '-' + Math.floor(Math.random() * 1000),
            quotationId: quote.id,
            vendorId: quote.vendorId,
            status: 'ISSUED',
            totalAmount: quote.totalAmount,
            generatedById: officerId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    await queryInterface.bulkInsert('purchase_orders', poData, {});

    console.log('✅ Mega Seeder completed');
  },

  down: async (queryInterface) => {}
};
