module.exports = {
  up: async (queryInterface, Sequelize) => {
    const uuidId = {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    };

    await queryInterface.createTable('roles', {
      id: uuidId,
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('users', {
      id: uuidId,
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      roleId: { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' } },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      refreshToken: { type: Sequelize.STRING },
      resetToken: { type: Sequelize.STRING },
      resetTokenExpiry: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('vendor_categories', {
      id: uuidId,
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('vendors', {
      id: uuidId,
      companyName: { type: Sequelize.STRING, allowNull: false },
      registrationNumber: { type: Sequelize.STRING, unique: true },
      taxId: { type: Sequelize.STRING },
      contactEmail: { type: Sequelize.STRING, allowNull: false },
      contactPhone: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      categoryId: { type: Sequelize.UUID, references: { model: 'vendor_categories', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'BLACKLISTED'), defaultValue: 'PENDING' },
      performanceScore: { type: Sequelize.FLOAT, defaultValue: 0.0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('vendor_users', {
      id: uuidId,
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('rfqs', {
      id: uuidId,
      rfqNumber: { type: Sequelize.STRING, unique: true, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'), defaultValue: 'DRAFT' },
      deadline: { type: Sequelize.DATE, allowNull: false },
      documents: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      createdBy: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('rfq_items', {
      id: uuidId,
      rfqId: { type: Sequelize.UUID, allowNull: false, references: { model: 'rfqs', key: 'id' } },
      itemName: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      uom: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('rfq_vendors', {
      id: uuidId,
      rfqId: { type: Sequelize.UUID, allowNull: false, references: { model: 'rfqs', key: 'id' } },
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('quotations', {
      id: uuidId,
      rfqId: { type: Sequelize.UUID, allowNull: false, references: { model: 'rfqs', key: 'id' } },
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      status: { type: Sequelize.ENUM('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED'), defaultValue: 'DRAFT' },
      totalAmount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      deliveryTimeDays: { type: Sequelize.INTEGER },
      validUntil: { type: Sequelize.DATE },
      documents: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      remarks: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('quotation_items', {
      id: uuidId,
      quotationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'quotations', key: 'id' } },
      rfqItemId: { type: Sequelize.UUID, allowNull: false, references: { model: 'rfq_items', key: 'id' } },
      unitPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      totalPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      remarks: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('approval_workflows', {
      id: uuidId,
      rfqId: { type: Sequelize.UUID, references: { model: 'rfqs', key: 'id' } },
      quotationId: { type: Sequelize.UUID, references: { model: 'quotations', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
      initiatorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('approval_steps', {
      id: uuidId,
      workflowId: { type: Sequelize.UUID, allowNull: false, references: { model: 'approval_workflows', key: 'id' } },
      approverId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
      remarks: { type: Sequelize.TEXT },
      stepOrder: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('purchase_orders', {
      id: uuidId,
      poNumber: { type: Sequelize.STRING, unique: true, allowNull: false },
      quotationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'quotations', key: 'id' } },
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      status: { type: Sequelize.ENUM('DRAFT', 'ISSUED', 'ACCEPTED', 'DELIVERED', 'CLOSED'), defaultValue: 'DRAFT' },
      totalAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      pdfUrl: { type: Sequelize.STRING },
      generatedById: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('invoices', {
      id: uuidId,
      invoiceNumber: { type: Sequelize.STRING, unique: true, allowNull: false },
      poId: { type: Sequelize.UUID, allowNull: false, references: { model: 'purchase_orders', key: 'id' } },
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'), defaultValue: 'PENDING' },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      taxAmount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      grandTotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      pdfUrl: { type: Sequelize.STRING },
      dueDate: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('notifications', {
      id: uuidId,
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      title: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      link: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('vendor_performance', {
      id: uuidId,
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      metricType: { type: Sequelize.STRING, allowNull: false },
      score: { type: Sequelize.FLOAT, allowNull: false },
      evaluationDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      remarks: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('external_messages', {
      id: uuidId,
      messageId: { type: Sequelize.STRING, unique: true },
      sender: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING },
      bodyText: { type: Sequelize.TEXT },
      bodyHtml: { type: Sequelize.TEXT },
      rfqId: { type: Sequelize.UUID, references: { model: 'rfqs', key: 'id' } },
      receivedAt: { type: Sequelize.DATE },
      attachments: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('activity_logs', {
      id: uuidId,
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      action: { type: Sequelize.STRING, allowNull: false },
      entity: { type: Sequelize.STRING, allowNull: false },
      entityId: { type: Sequelize.UUID },
      description: { type: Sequelize.TEXT },
      ipAddress: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_logs');
    await queryInterface.dropTable('external_messages');
    await queryInterface.dropTable('vendor_performance');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('purchase_orders');
    await queryInterface.dropTable('approval_steps');
    await queryInterface.dropTable('approval_workflows');
    await queryInterface.dropTable('quotation_items');
    await queryInterface.dropTable('quotations');
    await queryInterface.dropTable('rfq_vendors');
    await queryInterface.dropTable('rfq_items');
    await queryInterface.dropTable('rfqs');
    await queryInterface.dropTable('vendor_users');
    await queryInterface.dropTable('vendors');
    await queryInterface.dropTable('vendor_categories');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
  }
};
