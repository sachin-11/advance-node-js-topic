/**
 * Database Migration Script
 * Runs migrations and updates schema
 */

require('dotenv').config();
const db = require('./connection');

async function migrate() {
    console.log('\n🔄 Running database migrations...\n');

    if (!db.getPool()) {
        console.log('⚠️  Database not configured - skipping migrations\n');
        return;
    }

    try {
        // Test connection
        await db.testConnection();

        // Future migrations can be added here
        console.log('✅ Migrations completed\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await db.closePool();
    }
}

migrate();
