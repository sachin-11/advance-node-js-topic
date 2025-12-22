require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'google_search_engine',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },

    useDatabase: !!process.env.DB_HOST,

    crawler: {
        maxConcurrent: parseInt(process.env.CRAWLER_MAX_CONCURRENT) || 10,
        requestDelay: parseInt(process.env.CRAWLER_DELAY) || 1000, // ms
        timeout: parseInt(process.env.CRAWLER_TIMEOUT) || 30000, // ms
        maxDepth: parseInt(process.env.CRAWLER_MAX_DEPTH) || 5,
        userAgent: process.env.CRAWLER_USER_AGENT || 'GoogleBot/1.0'
    },

    indexer: {
        batchSize: parseInt(process.env.INDEXER_BATCH_SIZE) || 100,
        enableBigrams: process.env.INDEXER_BIGRAMS === 'true',
        minWordLength: parseInt(process.env.INDEXER_MIN_WORD_LENGTH) || 2
    },

    search: {
        defaultLimit: parseInt(process.env.SEARCH_DEFAULT_LIMIT) || 10,
        maxLimit: parseInt(process.env.SEARCH_MAX_LIMIT) || 100,
        cacheTTL: parseInt(process.env.SEARCH_CACHE_TTL) || 3600 // seconds
    },

    ranking: {
        tfidfWeight: parseFloat(process.env.RANKING_TFIDF_WEIGHT) || 0.6,
        pageRankWeight: parseFloat(process.env.RANKING_PAGERANK_WEIGHT) || 0.3,
        matchWeight: parseFloat(process.env.RANKING_MATCH_WEIGHT) || 0.1
    },

    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
};
