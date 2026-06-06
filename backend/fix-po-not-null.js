const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function runFix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB...');
    await sequelize.query('ALTER TABLE invoices ALTER COLUMN "poId" DROP NOT NULL');
    console.log('✅ poId is now optional in invoices table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

runFix();
