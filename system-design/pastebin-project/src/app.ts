import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectRedis, getRedisStatus } from './config/redis';
import pasteRoutes from './routes/pasteRoutes';
import { errorHandler } from './middlewares/index';
import { startExpirationCleanupWorker, stopExpirationCleanupWorker } from './workers/expirationCleanupWorker';
import { startViewCountWorker, stopViewCountWorker } from './workers/viewCountWorker';
import { swaggerSpec } from './config/swagger';
import path from 'path';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Support up to 10MB paste content
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Connect to Redis
connectRedis();

// Test database connection (already handled in database.ts, but ensure it's imported)
import pool from './config/database';
// Connection logging is handled in database.ts

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pastebin API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api', pasteRoutes);

// Public paste view route (with syntax highlighting)
app.get('/paste/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.query;
    
    // Redirect to view endpoint
    const redirectUrl = password 
        ? `/api/paste/${id}/view?password=${password}`
        : `/api/paste/${id}/view`;
    res.redirect(redirectUrl);
});

// Simple frontend route
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "ok"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               redis: "connected"
 */
app.get('/health', (req: Request, res: Response) => {
    const redisStatus = getRedisStatus();
    
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: redisStatus.connected ? 'connected' : 'disconnected',
    });
});

// Error Handler
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`🚀 Pastebin service running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    
    // Start background workers
    startExpirationCleanupWorker();
    startViewCountWorker();
});

// Handle port already in use error
server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Try one of these solutions:`);
        console.error(`   1. Stop the process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
        console.error(`   2. Use a different port: PORT=3001 npm run dev`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
        process.exit(1);
    }
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
    console.log(`${signal} received, shutting down gracefully...`);
    
    // Stop workers
    stopExpirationCleanupWorker();
    stopViewCountWorker();
    
    // Close server
    server.close(() => {
        console.log('HTTP server closed');
    });
    
    // Close database connections
    try {
        const pool = require('./config/database').default;
        await pool.end();
        console.log('PostgreSQL connection closed');
    } catch (error: any) {
        console.error('Error closing PostgreSQL:', error.message);
    }
    
    // Close Redis connection
    try {
        const { closeRedis } = require('./config/redis');
        await closeRedis();
        console.log('Redis connection closed');
    } catch (error: any) {
        console.error('Error closing Redis:', error.message);
    }
    
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
