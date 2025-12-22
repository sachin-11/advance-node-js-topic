/**
 * Express App Configuration
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();

// ═══════════════════════════════════════════
// Middleware
// ═══════════════════════════════════════════

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ═══════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════

app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Google Search Engine Backend',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            search: 'GET /api/v1/search?q={query}',
            autocomplete: 'GET /api/v1/autocomplete?q={query}',
            crawl: {
                add: 'POST /api/v1/crawl/add',
                process: 'POST /api/v1/crawl/process',
                status: 'GET /api/v1/crawl/status'
            },
            admin: {
                stats: 'GET /api/v1/admin/stats',
                pagerank: 'POST /api/v1/admin/pagerank'
            }
        }
    });
});

// ═══════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

module.exports = app;
