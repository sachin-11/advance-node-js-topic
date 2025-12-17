import { Pool } from 'pg';
import { DatabaseConfig } from '../models/types';

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'netflix_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production',
  max_connections: parseInt(process.env.DB_MAX_CONNECTIONS || '20')
};

// Create connection pool
const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.username,
  password: dbConfig.password,
  ssl: dbConfig.ssl,
  max: dbConfig.max_connections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers for monitoring
pool.on('connect', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('New client connected to PostgreSQL');
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('remove', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Client removed from pool');
  }
});

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
};

// Query helper functions
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;