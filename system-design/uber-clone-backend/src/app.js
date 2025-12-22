/**
 * Express App Configuration
 * Sets up Express middleware and routes
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const config = require('./config');
const routes = require('./routes');

const app = express();

// ═══════════════════════════════════════════
// Swagger UI Setup
// ═══════════════════════════════════════════

try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
    
    // Swagger UI options
    const swaggerOptions = {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Uber Clone Backend API',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true
        }
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
    console.log('📚 Swagger UI available at: http://localhost:' + config.port + '/api-docs');
} catch (error) {
    console.warn('⚠️  Swagger UI setup failed:', error.message);
    console.warn('   Make sure openapi.yaml exists in project root');
}

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

// Serve OpenAPI spec file
app.get('/openapi.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Uber Clone Backend',
        version: '1.0.0',
        status: 'running',
        documentation: 'See README.md for complete API documentation',
        endpoints: {
            health: 'GET /api/health',
            stats: 'GET /api/stats',
            rides: {
                getAll: 'GET /api/rides',
                getActive: 'GET /api/rides/active',
                getById: 'GET /api/rides/:id',
                request: 'POST /api/rides/request',
                estimateFare: 'POST /api/rides/estimate-fare',
                accept: 'POST /api/rides/:id/accept',
                start: 'POST /api/rides/:id/start',
                complete: 'POST /api/rides/:id/complete',
                cancel: 'POST /api/rides/:id/cancel'
            },
            drivers: {
                getAll: 'GET /api/drivers',
                getAvailable: 'GET /api/drivers/available',
                getById: 'GET /api/drivers/:id',
                getHistory: 'GET /api/drivers/:id/history',
                updateLocation: 'PUT /api/drivers/:driverId/location'
            }
        },
        documentation: {
            swagger: `http://localhost:${config.port}/api-docs`,
            openapi: `http://localhost:${config.port}/openapi.yaml`
        },
        websocket: {
            url: `ws://localhost:${config.port}`,
            events: 'See README.md for Socket.io events'
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
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: err.message
        });
    }

    // Handle JSON parse errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON',
            message: 'Request body must be valid JSON'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

module.exports = app;
