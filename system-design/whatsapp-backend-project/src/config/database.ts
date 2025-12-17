import { Pool } from 'pg';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'whatsapp_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

let isConnected = false;

// Test database connection
pool.on('connect', () => {
    if (!isConnected) {
        console.log('✅ PostgreSQL Database Connected');
        isConnected = true;
    }
});

pool.on('error', (err: any) => {
    const errorMessage = err?.message || err?.toString() || 'Unknown error';
    const errorCode = err?.code || 'N/A';
    console.error('❌ PostgreSQL Database Error:');
    console.error(`   Error: ${errorMessage}`);
    console.error(`   Code: ${errorCode}`);
    isConnected = false;
});

// Test connection on startup (non-blocking)
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL Database Ready');
        isConnected = true;
    } catch (err: any) {
        const isWindows = os.platform() === 'win32';
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        const errorCode = err?.code || 'N/A';
        
        console.error('❌ PostgreSQL Database Connection Failed:');
        console.error(`   Error: ${errorMessage}`);
        console.error(`   Code: ${errorCode}`);
        
        // Provide specific error guidance
        if (errorCode === 'ECONNREFUSED' || errorMessage.includes('connect ECONNREFUSED')) {
            console.error('\n⚠️  PostgreSQL service is not running or not accessible');
        } else if (errorMessage.includes('password authentication failed') || errorCode === '28P01') {
            console.error('\n⚠️  Authentication failed - check your DB_PASSWORD');
        } else if (errorMessage.includes('database') && errorMessage.includes('does not exist') || errorCode === '3D000') {
            console.error('\n⚠️  Database does not exist - you need to create it first');
        } else if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
            console.error('\n⚠️  Connection timeout - PostgreSQL might be slow to start');
        }
        
        console.error('\n💡 Make sure PostgreSQL is running and database exists:');
        
        if (isWindows) {
            console.error('   Windows:');
            console.error('   1. Start PostgreSQL service:');
            console.error('      net start postgresql-x64-15  (or your PostgreSQL service name)');
            console.error('      Or use Services app: services.msc');
            console.error('   2. Create database:');
            console.error('      psql -U postgres -c "CREATE DATABASE whatsapp_db;"');
            console.error('   3. Or run setup script:');
            console.error('      npm run setup-db');
        } else {
            console.error('   macOS/Linux:');
            console.error('   brew services start postgresql@15');
            console.error('   createdb -U postgres whatsapp_db');
            console.error('   npm run setup-db');
        }
        console.error('\n📝 Check your .env file for correct database credentials:\n');
        console.error(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
        console.error(`   DB_PORT=${process.env.DB_PORT || '5432'}`);
        console.error(`   DB_NAME=${process.env.DB_NAME || 'whatsapp_db'}`);
        console.error(`   DB_USER=${process.env.DB_USER || 'postgres'}`);
        console.error(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : 'postgres (default)'}\n`);
        
        isConnected = false;
    }
};

// Test connection asynchronously without blocking
testConnection();

// Export a function to check connection status
export const getDbStatus = () => isConnected;

export default pool;
