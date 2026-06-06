module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add new columns to invoices (checking if they exist first via raw query if needed, but here I'll just add the ones I know are missing)
    const tableInfo = await queryInterface.describeTable('invoices');

    if (!tableInfo.invoiceDate) {
      await queryInterface.addColumn('invoices', 'invoiceDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await queryInterface.sequelize.query('UPDATE invoices SET "invoiceDate" = NOW() WHERE "invoiceDate" IS NULL');
    }

    if (!tableInfo.rfqId) {
      await queryInterface.addColumn('invoices', 'rfqId', {
        type: Sequelize.UUID,
        references: { model: 'rfqs', key: 'id' }
      });
    }

    if (!tableInfo.quotationId) {
      await queryInterface.addColumn('invoices', 'quotationId', {
        type: Sequelize.UUID,
        references: { model: 'quotations', key: 'id' }
      });
    }

    if (!tableInfo.discountAmount) {
      await queryInterface.addColumn('invoices', 'discountAmount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      });
    }

    if (!tableInfo.additionalCharges) {
      await queryInterface.addColumn('invoices', 'additionalCharges', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      });
    }

    if (!tableInfo.paymentTerms) {
      await queryInterface.addColumn('invoices', 'paymentTerms', { type: Sequelize.TEXT });
    }

    if (!tableInfo.remarks) {
      await queryInterface.addColumn('invoices', 'remarks', { type: Sequelize.TEXT });
    }

    if (!tableInfo.bankDetails) {
      await queryInterface.addColumn('invoices', 'bankDetails', { type: Sequelize.TEXT });
    }

    if (!tableInfo.authorizedSignatory) {
      await queryInterface.addColumn('invoices', 'authorizedSignatory', { type: Sequelize.STRING });
    }

    if (!tableInfo.createdBy) {
      await queryInterface.addColumn('invoices', 'createdBy', {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' }
      });
    }

    // 2. Create invoice_items table
    const tableExists = await queryInterface.sequelize.query("SELECT * FROM information_schema.tables WHERE table_name = 'invoice_items'");
    if (tableExists[0].length === 0) {
      await queryInterface.createTable('invoice_items', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        invoiceId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'invoices', key: 'id' },
          onDelete: 'CASCADE'
        },
        itemDescription: { type: Sequelize.STRING, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        unitPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback logic
  }
};
