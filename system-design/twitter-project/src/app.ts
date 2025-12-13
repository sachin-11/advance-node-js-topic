import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectRedis, getRedisStatus } from './config/redis';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { optionalAuthenticate } from './middlewares/auth';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import timelineRoutes from './routes/timelineRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to Redis
connectRedis();

// Test database connection
import pool from './config/database';

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Twitter API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
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
 */
app.get('/health', (req: Request, res: Response) => {
    const redisStatus = getRedisStatus();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: redisStatus.connected ? 'connected' : 'disconnected',
        database: 'connected',
    });
});

// Apply rate limiting to API routes
app.use('/api', rateLimiter(100, 60000)); // 100 requests per minute

// Optional authentication for all routes (attaches user if token present)
app.use('/api', optionalAuthenticate);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/timeline', timelineRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Twitter API',
        version: '1.0.0',
        documentation: `${process.env.BASE_URL || 'http://localhost:3000'}/api-docs`,
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
    console.log(`🚀 Twitter service running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
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

    // Close server
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Close database connections
    try {
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
