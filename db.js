    // db.js  —  Drop this file in your Express project root or src/config/
// Usage:  const pool = require('./db');
//         const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'vendorbridge',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // Keep up to 10 clients in the pool
  max:                10,
  // Close idle clients after 30s
  idleTimeoutMillis:  30000,
  // Fail fast if connection takes > 2s
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('❌  DB test query failed:', err.message);
    } else {
      console.log('✅  PostgreSQL connected at', result.rows[0].now);
    }
  });
});

module.exports = pool;


// ─────────────────────────────────────────────────────────────
//  .env file your backend team needs  (copy to project root)
// ─────────────────────────────────────────────────────────────
//
//  DB_HOST=localhost
//  DB_PORT=5432
//  DB_NAME=vendorbridge
//  DB_USER=postgres
//  DB_PASSWORD=yourpassword
//  JWT_SECRET=change_this_to_a_long_random_string
//  JWT_EXPIRES_IN=7d
//  PORT=5000
//  MAIL_HOST=smtp.gmail.com
//  MAIL_PORT=587
//  MAIL_USER=your@gmail.com
//  MAIL_PASS=your_app_password
//  CLIENT_URL=http://localhost:5173
//
// ─────────────────────────────────────────────────────────────
//  HOW TO INSTALL pg:
//    npm install pg dotenv
// ─────────────────────────────────────────────────────────────
//
//  EXAMPLE QUERIES using your schema:
//
//  // Get all active vendors with category name
//  const { rows } = await pool.query(`
//    SELECT v.*, vc.name AS category_name
//    FROM vendors v
//    LEFT JOIN vendor_categories vc ON vc.id = v.category_id
//    WHERE v.status = 'active'
//    ORDER BY v.company_name
//  `);
//
//  // Get user by email (for login)
//  const { rows } = await pool.query(`
//    SELECT u.*, r.name AS role_name
//    FROM users u
//    JOIN roles r ON r.id = u.role_id
//    WHERE u.email = $1 AND u.is_active = true
//  `, [email]);
//
//  // Get RFQ with items and vendor count
//  const { rows } = await pool.query(`
//    SELECT
//      r.*,
//      u.first_name || ' ' || u.last_name AS created_by_name,
//      COUNT(DISTINCT ri.id)  AS item_count,
//      COUNT(DISTINCT rv.id)  AS vendor_count,
//      COUNT(DISTINCT q.id)   AS quotation_count
//    FROM rfqs r
//    JOIN users u            ON u.id = r.created_by
//    LEFT JOIN rfq_items ri  ON ri.rfq_id = r.id
//    LEFT JOIN rfq_vendors rv ON rv.rfq_id = r.id
//    LEFT JOIN quotations q  ON q.rfq_id = r.id
//    WHERE r.id = $1
//    GROUP BY r.id, u.first_name, u.last_name
//  `, [rfqId]);
//
//  // Dashboard stats (uses the view we created)
//  const { rows } = await pool.query('SELECT * FROM v_dashboard_stats');
//
//  // Quotation comparison for an RFQ
//  const { rows } = await pool.query(
//    'SELECT * FROM v_quotation_comparison WHERE rfq_id = $1 ORDER BY price_rank',
//    [rfqId]
//  );
