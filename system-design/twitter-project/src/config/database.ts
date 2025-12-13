import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'twitter',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected PostgreSQL error:', err);
    process.exit(-1);
});

// Test initial connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
    } else {
        console.log('✅ PostgreSQL connection test successful');
    }
});

/**
 * Query helper function
 */
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (duration > 1000) {
            console.warn(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100));
        }

        return result.rows;
    } catch (error: any) {
        console.error('❌ Database query error:', error.message);
        console.error('Query:', text);
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
    return await pool.connect();
}

/**
 * Close the pool
 */
export async function closePool(): Promise<void> {
    await pool.end();
    console.log('PostgreSQL pool closed');
}

export default pool;
