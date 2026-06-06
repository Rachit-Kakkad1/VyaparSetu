module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      recipientEmail: { type: Sequelize.STRING, allowNull: false },
      recipientRole: { type: Sequelize.STRING },
      subject: { type: Sequelize.STRING, allowNull: false },
      templateName: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'FAILED'),
        defaultValue: 'PENDING'
      },
      messageId: { type: Sequelize.STRING },
      entityType: { type: Sequelize.STRING },
      entityId: { type: Sequelize.UUID },
      sentBy: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' }
      },
      errorMessage: { type: Sequelize.TEXT },
      ipAddress: { type: Sequelize.STRING },
      sentAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_logs');
  }
};
