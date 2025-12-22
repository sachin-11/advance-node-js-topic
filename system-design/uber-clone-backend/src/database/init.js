/**
 * Database Initialization Script
 * Creates tables and initializes database schema
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function initDatabase() {
    console.log('\n' + '═'.repeat(60));
    console.log('🗄️  INITIALIZING POSTGRESQL DATABASE');
    console.log('═'.repeat(60));

    if (!config.useDatabase) {
        console.log('\n⚠️  Database not configured in .env file');
        console.log('   Set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD to use PostgreSQL');
        console.log('   Currently using in-memory storage\n');
        return;
    }

    const pool = new Pool(config.database);

    try {
        // Test connection
        console.log('\n📡 Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        console.log('\n📋 Creating database schema...');
        await client.query(schemaSQL);
        console.log('✅ Database schema created successfully');

        // Verify tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\n📊 Created tables:');
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        client.release();

        console.log('\n' + '═'.repeat(60));
        console.log('✅ DATABASE INITIALIZATION COMPLETE');
        console.log('═'.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Database initialization failed:');
        console.error('   Error:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   1. PostgreSQL is running');
        console.error('   2. Database exists (create it manually if needed)');
        console.error('   3. User has proper permissions');
        console.error('   4. Connection details in .env are correct\n');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run initialization
initDatabase();
