/**
 * Server Entry Point
 * Initializes HTTP server and Socket.io
 */

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const setupSocketHandlers = require('./socket');
const db = require('./database/connection');

// ═══════════════════════════════════════════
// Create HTTP Server
// ═══════════════════════════════════════════

const server = http.createServer(app);

// ═══════════════════════════════════════════
// Initialize Socket.io
// ═══════════════════════════════════════════

const io = new Server(server, {
    cors: config.cors
});

// Setup socket event handlers
setupSocketHandlers(io);

// ═══════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════

const PORT = config.port;

// Initialize database connection
async function startServer() {
    // Initialize database if configured
    if (config.useDatabase) {
        db.initPool();
        const connected = await db.testConnection();
        if (!connected) {
            console.log('\n⚠️  Database connection failed - continuing with in-memory storage\n');
        }
    }

    server.listen(PORT, () => {
        console.log('\n' + '═'.repeat(60));
        console.log('🚕 UBER CLONE BACKEND - PRODUCTION READY');
        console.log('═'.repeat(60));
        console.log(`\n📡 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${config.nodeEnv}`);
        console.log(`💾 Storage: ${config.useDatabase ? 'PostgreSQL' : 'In-Memory'}`);
        console.log(`\n📋 API Endpoints:`);
        console.log(`   Health:  http://localhost:${PORT}/api/health`);
        console.log(`   Stats:   http://localhost:${PORT}/api/stats`);
        console.log(`   Rides:   http://localhost:${PORT}/api/rides`);
        console.log(`   Drivers: http://localhost:${PORT}/api/drivers`);
        console.log(`\n📚 API Documentation:`);
        console.log(`   Swagger UI: http://localhost:${PORT}/api-docs`);
        console.log(`   OpenAPI Spec: http://localhost:${PORT}/openapi.yaml`);
        console.log(`\n🔌 WebSocket: ws://localhost:${PORT}`);
        console.log(`\n💡 Socket Events:`);
        console.log(`   Driver:  driver:online, driver:location`);
        console.log(`   Rider:   ride:request, rider:track`);
        console.log(`   Ride:    ride:accept, ride:start, ride:complete`);
        console.log('\n' + '═'.repeat(60));
        console.log('⏸️  Press Ctrl+C to stop\n');
    });
}

startServer();

// ═══════════════════════════════════════════
// Graceful Shutdown
// ═══════════════════════════════════════════

process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down gracefully...');

    server.close(async () => {
        // Close database connections
        if (config.useDatabase) {
            await db.closePool();
        }
        console.log('✅ Server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown');
        process.exit(1);
    }, 10000);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});
