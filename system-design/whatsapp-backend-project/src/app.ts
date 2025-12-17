import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { connectRedis, getRedisStatus } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './config/swagger';
import { getUploadsDir } from './config/localStorage';

// Import database to initialize connection
import './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import groupRoutes from './routes/groupRoutes';
import contactRoutes from './routes/contactRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use(rateLimiter(100, 60000)); // 100 requests per minute

// Connect to Redis
connectRedis();

// Serve static files (for local storage)
const USE_S3 = process.env.USE_S3 === 'true' && 
               process.env.AWS_ACCESS_KEY_ID && 
               process.env.AWS_SECRET_ACCESS_KEY;

if (!USE_S3) {
  // Serve uploaded media from local storage
  const uploadsDir = getUploadsDir();
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y', // Cache for 1 year
    etag: true,
  }));
  console.log(`📁 Serving local uploads from: ${uploadsDir}`);
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WhatsApp API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contacts', contactRoutes);

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
  console.log(`🚀 WhatsApp service running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});

// Handle port already in use error
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Try one of these solutions:`);
    console.error(`   1. Stop the process using port ${PORT}`);
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
