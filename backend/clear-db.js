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

async function clearDB() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB for clearing...');
    
    // Drop all tables in public schema
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO postgres;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
    
    console.log('✅ Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

clearDB();
