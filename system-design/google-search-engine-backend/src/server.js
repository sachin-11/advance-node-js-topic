/**
 * Server Entry Point
 */

const http = require('http');
const app = require('./app');
const config = require('./config');
const db = require('./database/connection');

// ═══════════════════════════════════════════
// Create HTTP Server
// ═══════════════════════════════════════════

const server = http.createServer(app);

// ═══════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════

async function startServer() {
    // Initialize database if configured
    if (config.useDatabase) {
        db.initPool();
        const connected = await db.testConnection();
        if (!connected) {
            console.log('\n⚠️  Database connection failed\n');
        }
    }

    const PORT = config.port;

    server.listen(PORT, () => {
        console.log('\n' + '═'.repeat(60));
        console.log('🔍 GOOGLE SEARCH ENGINE BACKEND');
        console.log('═'.repeat(60));
        console.log(`\n📡 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${config.nodeEnv}`);
        console.log(`💾 Storage: ${config.useDatabase ? 'PostgreSQL' : 'In-Memory'}`);
        console.log(`\n📋 API Endpoints:`);
        console.log(`   Search:      http://localhost:${PORT}/api/v1/search?q=query`);
        console.log(`   Autocomplete: http://localhost:${PORT}/api/v1/autocomplete?q=query`);
        console.log(`   Crawl:       http://localhost:${PORT}/api/v1/crawl/add`);
        console.log(`   Admin Stats: http://localhost:${PORT}/api/v1/admin/stats`);
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
        if (config.useDatabase) {
            await db.closePool();
        }
        console.log('✅ Server closed');
        process.exit(0);
    });

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
