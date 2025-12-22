require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'uber_clone',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },

    // Use database if DB_HOST is set, otherwise use in-memory
    useDatabase: !!process.env.DB_HOST,

    fare: {
        baseFare: parseFloat(process.env.BASE_FARE) || 50,
        perKm: parseFloat(process.env.PER_KM_RATE) || 12,
        perMinute: parseFloat(process.env.PER_MINUTE_RATE) || 2,
        serviceFee: parseFloat(process.env.SERVICE_FEE) || 10,
        gstRate: parseFloat(process.env.GST_RATE) || 0.05,
        minFare: 60
    },

    surge: {
        enabled: process.env.SURGE_ENABLED === 'true',
        zones: ['downtown', 'airport', 'suburb']
    },

    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
};
