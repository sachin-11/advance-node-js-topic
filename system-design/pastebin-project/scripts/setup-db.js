const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Setup script to create database and run migrations
 * Run with: node scripts/setup-db.js
 */

const DB_NAME = process.env.DB_NAME || 'pastebin_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

console.log('🚀 Setting up Pastebin database...\n');

// Check if PostgreSQL is available
try {
  console.log('📋 Checking PostgreSQL connection...');
  execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "SELECT 1"`, {
    stdio: 'ignore',
  });
  console.log('✅ PostgreSQL is running\n');
} catch (error) {
  console.error('❌ Cannot connect to PostgreSQL');
  console.error('💡 Make sure PostgreSQL is running:');
  console.error('   brew services start postgresql@15\n');
  process.exit(1);
}

// Create database
try {
  console.log(`📦 Creating database '${DB_NAME}'...`);
  
  // Check if database exists
  const checkDb = execSync(
    `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'"`,
    { encoding: 'utf8' }
  );

  if (checkDb.trim() === '1') {
    console.log(`⚠️  Database '${DB_NAME}' already exists`);
  } else {
    execSync(
      `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME}"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Database '${DB_NAME}' created successfully\n`);
  }
} catch (error) {
  console.error('❌ Failed to create database');
  console.error(error.message);
  process.exit(1);
}

// Run migrations
try {
  console.log('📝 Running migrations...');
  const schemaPath = path.join(__dirname, '../src/db/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  execSync(
    `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ${schemaPath}`,
    { stdio: 'inherit' }
  );
  
  console.log('✅ Migrations completed successfully\n');
  console.log('🎉 Database setup complete!');
  console.log('💡 You can now start the server with: npm run dev\n');
} catch (error) {
  console.error('❌ Migration failed');
  console.error(error.message);
  process.exit(1);
}

