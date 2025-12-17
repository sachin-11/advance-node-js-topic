const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Setup script to create database and run migrations
 * Run with: node scripts/setup-db.js
 */

const DB_NAME = process.env.DB_NAME || 'whatsapp_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

console.log('🚀 Setting up WhatsApp database...\n');

// Connect to PostgreSQL server (using default 'postgres' database)
const adminPool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: 'postgres', // Connect to default database
  connectionTimeoutMillis: 5000,
});

async function setupDatabase() {
  try {
    // Check if PostgreSQL is available
    console.log('📋 Checking PostgreSQL connection...');
    await adminPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL is running\n');

    // Check if database exists
    console.log(`📦 Creating database '${DB_NAME}'...`);
    const checkDb = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkDb.rows.length > 0) {
      console.log(`⚠️  Database '${DB_NAME}' already exists`);
    } else {
      await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✅ Database '${DB_NAME}' created successfully\n`);
    }

    // Close admin connection
    await adminPool.end();

    // Connect to the new database to run migrations
    const dbPool = new Pool({
      user: DB_USER,
      host: DB_HOST,
      port: DB_PORT,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectionTimeoutMillis: 5000,
    });

    // Run migrations
    console.log('📝 Running migrations...');
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      await dbPool.end();
      process.exit(1);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await dbPool.query(schemaSQL);
    
    console.log('✅ Migrations completed successfully\n');
    await dbPool.end();

    console.log('🎉 Database setup complete!');
    console.log('💡 You can now start the server with: npm run dev\n');
  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure PostgreSQL is running:');
      const os = require('os');
      if (os.platform() === 'win32') {
        console.error('   Windows: net start postgresql-x64-15');
        console.error('   Or use Services app: services.msc');
      } else {
        console.error('   macOS/Linux: brew services start postgresql@15');
      }
    } else if (error.code === '28P01') {
      console.error('💡 Authentication failed - check your DB_PASSWORD in .env file');
    }
    
    await adminPool.end();
    process.exit(1);
  }
}

setupDatabase();
