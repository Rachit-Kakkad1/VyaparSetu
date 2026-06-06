module.exports = {
  up: async (queryInterface, Sequelize) => {
    const uuidId = {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    };

    await queryInterface.createTable('conversations', {
      id: uuidId,
      type: {
        type: Sequelize.ENUM('RFQ_NEGOTIATION', 'DIRECT_SUPPORT', 'GENERAL'),
        allowNull: false
      },
      reference_id: { type: Sequelize.UUID },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'CLOSED', 'ARCHIVED'),
        defaultValue: 'ACTIVE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('conversation_participants', {
      id: uuidId,
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      role: {
        type: Sequelize.ENUM('INITIATOR', 'PARTICIPANT'),
        defaultValue: 'PARTICIPANT'
      },
      joined_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    await queryInterface.createTable('messages', {
      id: uuidId,
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE'
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('message_reads', {
      id: uuidId,
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'messages', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      read_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('message_reads');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversation_participants');
    await queryInterface.dropTable('conversations');
  }
};
