import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { shortenUrl, redirectUrl, getStats } from './controllers/urlController';
import { rateLimiter } from './middleware/rateLimiter';
import { startClickCountWorker, stopClickCountWorker } from './workers/clickCountWorker';
import { swaggerSpec } from './config/swagger';
import { getRedisStatus } from './cache/redis';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// CORS middleware (for Swagger UI and API access)
app.use((req: Request, res: Response, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Apply rate limiting to all routes
app.use(rateLimiter(100, 60000)); // 100 requests per minute

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TinyURL API Documentation',
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "ok"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
app.get('/health', (req: Request, res: Response) => {
  const redisStatus = getRedisStatus();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: redisStatus.connected ? 'connected' : 'disconnected',
  });
});

/**
 * @swagger
 * /api/debug/cache:
 *   get:
 *     summary: Debug endpoint to check Redis cache status
 *     tags: [Health]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Optional short code to check in cache
 *         example: abc
 *     responses:
 *       200:
 *         description: Cache debug information
 */
app.get('/api/debug/cache', async (req: Request, res: Response) => {
  const { getRedisStatus, get, keys } = require('./cache/redis');
  const redisStatus = getRedisStatus();
  const { code } = req.query;

  const debugInfo: any = {
    redis: {
      connected: redisStatus.connected,
      ready: redisStatus.ready,
      disabled: redisStatus.disabled,
    },
    timestamp: new Date().toISOString(),
  };

  if (code && typeof code === 'string') {
    // Check specific code
    const cacheKey = `url:${code}`;
    const cachedValue = await get(cacheKey);
    debugInfo.code = code;
    debugInfo.cacheKey = cacheKey;
    debugInfo.cached = cachedValue !== null;
    debugInfo.cachedValue = cachedValue;
  } else {
    // Show all cached URLs
    const allKeys = await keys('url:*');
    debugInfo.cachedKeys = allKeys;
    debugInfo.cachedCount = allKeys.length;

    // Show click count keys
    const clickKeys = await keys('clicks:*');
    debugInfo.clickKeys = clickKeys;
    debugInfo.clickCountKeys = clickKeys.length;
  }

  res.json(debugInfo);
});

// API Routes
app.post('/api/shorten', shortenUrl);
app.get('/api/stats/:code', getStats);

// Redirect route (must be last to catch all :code patterns)
app.get('/:code', redirectUrl);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 TinyURL service running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  
  // Start background worker for click count updates
  startClickCountWorker();
});

// Handle port already in use error
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Try one of these solutions:`);
    console.error(`   1. Stop the process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   2. Use a different port: PORT=3001 npm run dev`);
    console.error(`   3. Find and kill the process: kill -9 $(lsof -t -i:${PORT})`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  
  // Stop the click count worker
  stopClickCountWorker();
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  try {
    await require('./db/pg').closePool();
    console.log('PostgreSQL connection closed');
  } catch (error: any) {
    console.error('Error closing PostgreSQL:', error.message);
  }
  
  // Close Redis connection
  try {
    await require('./cache/redis').closeRedis();
    console.log('Redis connection closed');
  } catch (error: any) {
    console.error('Error closing Redis:', error.message);
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

