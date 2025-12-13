import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pastebin_db',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ PostgreSQL Database Connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Database Error:', err.message);
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✅ PostgreSQL Database Ready');
    })
    .catch((err) => {
        console.error('❌ PostgreSQL Database Connection Failed:', err.message);
        console.error('💡 Make sure PostgreSQL is running and database exists:');
        console.error('   brew services start postgresql@15');
        console.error('   createdb -U postgres pastebin_db');
        console.error('   npm run setup-db');
    });

export default pool;
