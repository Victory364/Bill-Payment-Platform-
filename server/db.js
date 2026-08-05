import dns from 'dns';
dns.setDefaultResultOrder('ipv4first'); // Fix EAI_AGAIN on Windows / IPv6 networks

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Fallback resolver using public DNS servers to bypass broken local/ISP resolvers on Windows
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(['8.8.8.8', '1.1.1.1']);

function customLookup(hostname, options, callback) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return dns.lookup(hostname, options, callback);
  }

  dnsResolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      // Fallback to standard DNS lookup
      return dns.lookup(hostname, options, callback);
    }
    callback(null, addresses[0], 4);
  });
}

// Strip Neon-specific params unsupported by pg driver
const rawUrl = (process.env.DATABASE_URL || '').replace('channel_binding=require', '').replace('&&', '&').replace(/[?&]$/, '');

// Initialize PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: rawUrl,
  ssl: rawUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  lookup: customLookup,
});

/** Initialize database schema & log connection status */
export async function initDb() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPlaceholder = dbUrl.includes('ep-your-name') || dbUrl.includes('YOUR_PASSWORD');

  if (!dbUrl || isPlaceholder) {
    console.log('\n============================================================');
    console.log('⚠️ DATABASE STATUS: NOT CONNECTED YET');
    console.log('   Reason: server/.env is using the default placeholder URL.');
    console.log('\n👉 HOW TO FIX:');
    console.log('   1. Open file: server/.env');
    console.log('   2. Paste your real Neon PostgreSQL URL on Line 7:');
    console.log('      DATABASE_URL="postgresql://neondb_owner:YOUR_PASS@ep-xxx.neon.tech/neondb?sslmode=require"');
    console.log('============================================================\n');
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          password_hash TEXT NOT NULL,
          wallet_balance NUMERIC(12, 2) DEFAULT 50000.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'success',
          reference VARCHAR(100),
          date VARCHAR(50),
          phone VARCHAR(50),
          operator VARCHAR(50),
          meter_number VARCHAR(100),
          customer_name VARCHAR(255),
          address TEXT,
          meter_type VARCHAR(50),
          token VARCHAR(100),
          smartcard_no VARCHAR(100),
          package_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          transaction_limit NUMERIC(12, 2) DEFAULT 20000.00,
          enable_biometrics BOOLEAN DEFAULT TRUE,
          enable_notifications BOOLEAN DEFAULT TRUE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          time VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('\n============================================================');
      console.log('🎉 DATABASE STATUS: CONNECTED SUCCESSFULLY! 💚');
      console.log('   Provider: Neon PostgreSQL');
      console.log('   Schema: Verified & Ready (users, transactions, settings, notifications)');
      console.log('============================================================\n');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.log('\n============================================================');
    console.log('⚠️ DATABASE STATUS: CONNECTION FAILED ❌');
    console.log(`   Error: ${err.message}`);
    console.log('\n👉 HOW TO FIX:');
    console.log('   1. Check your internet connection.');
    console.log('   2. Verify your connection string in server/.env.');
    console.log('============================================================\n');
    return false;
  }
}

export default pool;
