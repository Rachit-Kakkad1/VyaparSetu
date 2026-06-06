const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id, email FROM users;');
    const userRows = users[0];

    const admin = userRows.find(u => u.email === 'admin@vyaparsetu.com');
    const officer = userRows.find(u => u.email === 'procurement@vyaparsetu.com');
    const vendorUser = userRows.find(u => u.email === 'vendor@vyaparsetu.com');

    if (!admin || !officer || !vendorUser) {
        throw new Error('Required seed users not found. Check demo-users seeder.');
    }

    // 1. Create a Vendor
    const vendorId = uuidv4();
    await queryInterface.bulkInsert('vendors', [{
      id: vendorId,
      companyName: 'Acme Supplies Ltd',
      registrationNumber: 'REG123456',
      taxId: 'GSTIN990011',
      contactEmail: 'vendor@vyaparsetu.com',
      contactPhone: '+91 98765 43210',
      address: '123 Industrial Estate, Mumbai, India',
      status: 'APPROVED',
      performanceScore: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Link Vendor to User
    await queryInterface.bulkInsert('vendor_users', [{
      id: uuidv4(),
      vendorId: vendorId,
      userId: vendorUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 2. Create an RFQ
    const rfqId = uuidv4();
    await queryInterface.bulkInsert('rfqs', [{
      id: rfqId,
      rfqNumber: 'RFQ-2026-001',
      title: 'Procurement of 50 Laptops',
      description: 'High-end developer laptops required for engineering team.',
      status: 'PUBLISHED',
      deadline: new Date(Date.now() + 86400000 * 7), 
      documents: ['https://example.com/spec.pdf'],
      createdBy: officer.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    const rfqItemId = uuidv4();
    await queryInterface.bulkInsert('rfq_items', [{
      id: rfqItemId,
      rfqId: rfqId,
      itemName: 'Dell XPS 15',
      description: 'i9, 32GB RAM, 1TB SSD',
      quantity: 50,
      uom: 'UNIT',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('rfq_vendors', [{
      id: uuidv4(),
      rfqId: rfqId,
      vendorId: vendorId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 3. Create a Quotation
    const quoteId = uuidv4();
    await queryInterface.bulkInsert('quotations', [{
      id: quoteId,
      rfqId: rfqId,
      vendorId: vendorId,
      status: 'ACCEPTED',
      totalAmount: 2400000.00,
      deliveryTimeDays: 10,
      validUntil: new Date(Date.now() + 86400000 * 30),
      remarks: 'Best price guaranteed with 3 years onsite warranty.',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('quotation_items', [{
      id: uuidv4(),
      quotationId: quoteId,
      rfqItemId: rfqItemId,
      unitPrice: 48000.00,
      totalPrice: 2400000.00,
      remarks: 'Bulk discount applied',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 4. Create a PO
    const poId = uuidv4();
    await queryInterface.bulkInsert('purchase_orders', [{
        id: poId,
        poNumber: 'PO-2026-001',
        quotationId: quoteId,
        vendorId: vendorId,
        status: 'ISSUED',
        totalAmount: 2400000.00,
        generatedById: officer.id,
        createdAt: new Date(),
        updatedAt: new Date()
    }]);

    // 5. Create a Shipment
    await queryInterface.bulkInsert('shipments', [{
      id: uuidv4(),
      shipmentNumber: 'SHP-983021',
      poId: poId,
      vendorId: vendorId,
      status: 'IN_TRANSIT',
      originLat: 19.0760,
      originLng: 72.8777,
      destinationLat: 18.5204,
      destinationLng: 73.8567,
      currentLat: 18.8800,
      currentLng: 73.2200,
      progressPercentage: 45.0,
      estimatedArrival: new Date(Date.now() + 3600000),
      isDelivered: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('shipments', null, {});
    await queryInterface.bulkDelete('purchase_orders', null, {});
    await queryInterface.bulkDelete('quotation_items', null, {});
    await queryInterface.bulkDelete('quotations', null, {});
    await queryInterface.bulkDelete('rfq_vendors', null, {});
    await queryInterface.bulkDelete('rfq_items', null, {});
    await queryInterface.bulkDelete('rfqs', null, {});
    await queryInterface.bulkDelete('vendor_users', null, {});
    await queryInterface.bulkDelete('vendors', null, {});
  }
};
