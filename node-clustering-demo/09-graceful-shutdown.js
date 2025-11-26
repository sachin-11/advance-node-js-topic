// ============================================
// Example 9: Graceful Shutdown
// ============================================
// Ye example dikhata hai ki server ko gracefully kaise shutdown karte hain
// Current requests complete hote hain, phir worker exit hota hai

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3008;

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🛑 Graceful Shutdown Example');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  console.log(`🌍 Server running at http://localhost:${PORT}`);
  console.log(`\n💡 Press Ctrl+C to trigger graceful shutdown`);
  console.log(`   Watch how workers finish current requests before exiting\n`);

  // Handle graceful shutdown
  let shutdownInProgress = false;

  function gracefulShutdown(signal) {
    if (shutdownInProgress) return;
    shutdownInProgress = true;

    console.log(`\n\n📡 Received ${signal}. Initiating graceful shutdown...\n`);

    // Disconnect all workers (stop accepting new connections)
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      console.log(`   🔄 Disconnecting Worker ${worker.id}...`);
      worker.disconnect();
    }

    // Wait for workers to finish
    let workersFinished = 0;
    const totalWorkers = Object.keys(cluster.workers).length;

    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      
      worker.on('disconnect', () => {
        console.log(`   ✅ Worker ${worker.id} disconnected (finishing requests)`);
      });

      worker.on('exit', (code, signal) => {
        workersFinished++;
        console.log(`   🛑 Worker ${worker.id} exited (code: ${code}, signal: ${signal})`);
        
        if (workersFinished === totalWorkers) {
          console.log(`\n✅ All workers shut down gracefully`);
          console.log(`👋 Master process exiting...\n`);
          process.exit(0);
        }
      });
    }

    // Force exit after 30 seconds if workers don't exit
    setTimeout(() => {
      console.log(`\n⚠️  Force killing workers after timeout...`);
      for (const id in cluster.workers) {
        cluster.workers[id].kill('SIGKILL');
      }
      process.exit(1);
    }, 30000);
  }

  // Handle signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  cluster.on('exit', (worker, code, signal) => {
    if (!shutdownInProgress) {
      console.log(`\n⚠️  Worker ${worker.id} died unexpectedly. Restarting...`);
      cluster.fork();
    }
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;
  let activeConnections = new Set();
  let server;

  server = http.createServer((req, res) => {
    const connectionId = `${Date.now()}-${Math.random()}`;
    activeConnections.add(connectionId);

    const startTime = Date.now();
    
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Request completed',
        workerId: workerId,
        workerPid: process.pid,
        connectionId: connectionId,
        processingTime: `${elapsed}ms`,
        activeConnections: activeConnections.size,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`   ✅ Worker ${workerId} completed request (${connectionId}) - ${elapsed}ms`);
      activeConnections.delete(connectionId);
    }, processingTime);

    req.on('close', () => {
      activeConnections.delete(connectionId);
      console.log(`   🔌 Worker ${workerId} connection closed (${connectionId})`);
    });
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} listening on port ${PORT} (PID: ${process.pid})`);
  });

  // Graceful shutdown handler
  function gracefulShutdown(signal) {
    console.log(`\n   📡 Worker ${workerId} received ${signal}`);
    console.log(`   🔄 Active connections: ${activeConnections.size}`);
    
    if (activeConnections.size === 0) {
      console.log(`   ✅ Worker ${workerId} has no active connections. Exiting...`);
      server.close(() => {
        console.log(`   👋 Worker ${workerId} server closed. Exiting process...`);
        process.exit(0);
      });
    } else {
      console.log(`   ⏳ Worker ${workerId} waiting for ${activeConnections.size} connection(s) to finish...`);
      
      // Stop accepting new connections
      server.close(() => {
        console.log(`   ✅ Worker ${workerId} stopped accepting new connections`);
      });

      // Check periodically if all connections are done
      const checkInterval = setInterval(() => {
        if (activeConnections.size === 0) {
          clearInterval(checkInterval);
          console.log(`   ✅ Worker ${workerId} all connections finished. Exiting...`);
          process.exit(0);
        } else {
          console.log(`   ⏳ Worker ${workerId} still has ${activeConnections.size} active connection(s)...`);
        }
      }, 500);

      // Force exit after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log(`   ⚠️  Worker ${workerId} forcing exit after timeout`);
        process.exit(1);
      }, 10000);
    }
  }

  // Handle disconnect from master
  process.on('disconnect', () => {
    console.log(`\n   📡 Worker ${workerId} received disconnect from master`);
    gracefulShutdown('disconnect');
  });

  // Handle signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

