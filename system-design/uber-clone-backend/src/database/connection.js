/**
 * PostgreSQL Database Connection
 * Manages database connection pool
 */

const { Pool } = require('pg');
const config = require('../config');

let pool = null;

/**
 * Initialize database connection pool
 */
function initPool() {
    if (pool) {
        return pool;
    }

    if (!config.useDatabase) {
        console.log('⚠️  Database not configured - using in-memory storage');
        return null;
    }

    try {
        pool = new Pool(config.database);

        pool.on('error', (err) => {
            console.error('❌ Unexpected error on idle client', err);
            process.exit(-1);
        });

        console.log('✅ PostgreSQL connection pool created');
        return pool;
    } catch (error) {
        console.error('❌ Failed to create database pool:', error.message);
        return null;
    }
}

/**
 * Get database pool
 */
function getPool() {
    if (!pool && config.useDatabase) {
        return initPool();
    }
    return pool;
}

/**
 * Test database connection
 */
async function testConnection() {
    const dbPool = getPool();
    if (!dbPool) {
        return false;
    }

    try {
        const client = await dbPool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connected:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}

/**
 * Execute a query
 */
async function query(text, params) {
    const dbPool = getPool();
    if (!dbPool) {
        throw new Error('Database not configured');
    }

    const start = Date.now();
    try {
        const res = await dbPool.query(text, params);
        const duration = Date.now() - start;
        console.log(`📊 Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
        return res;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        throw error;
    }
}

/**
 * Get a client from the pool (for transactions)
 */
async function getClient() {
    const dbPool = getPool();
    if (!dbPool) {
        throw new Error('Database not configured');
    }
    return await dbPool.connect();
}

/**
 * Close database connection pool
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ Database connection pool closed');
    }
}

module.exports = {
    initPool,
    getPool,
    testConnection,
    query,
    getClient,
    closePool
};
