import 'dotenv/config';
import app from './app';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log('🚀 Starting Netflix Streaming Platform...');

    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Connect to Redis
    console.log('🔄 Connecting to Redis...');
    const redisConnected = await connectRedis();
    if (!redisConnected) {
      throw new Error('Redis connection failed');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('✅ Netflix Streaming Platform is running!');
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🛠️  Environment: ${NODE_ENV}`);
      console.log('');
      console.log('Available endpoints:');
      console.log(`  Health Check: GET  /health`);
      console.log(`  API Docs:     GET  /api-docs`);
      console.log(`  Register:     POST /api/auth/register`);
      console.log(`  Login:        POST /api/auth/login`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();