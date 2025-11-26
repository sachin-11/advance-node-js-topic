// ============================================
// Example 4: Zero-Downtime Restart
// ============================================
// Ye example dikhata hai ki workers ko kaise gracefully restart karte hain
// Bina server ko down kiye

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3002;

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🔄 Zero-Downtime Restart Example');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker one by one
  let restartCount = 0;
  const maxRestarts = 2; // Restart each worker twice for demo

  function restartNextWorker() {
    const workers = Object.values(cluster.workers);
    if (workers.length === 0) return;

    const worker = workers[restartCount % workers.length];
    console.log(`\n🔄 Restarting Worker ${worker.id} (PID: ${worker.process.pid})...`);
    
    // Disconnect worker (stops accepting new connections)
    worker.disconnect();

    // Wait for worker to finish current requests
    worker.on('disconnect', () => {
      console.log(`   ✅ Worker ${worker.id} disconnected (finishing current requests)`);
    });

    // When worker exits, fork a new one
    worker.on('exit', () => {
      console.log(`   🛑 Worker ${worker.id} exited`);
      const newWorker = cluster.fork();
      console.log(`   ✨ New Worker ${newWorker.id} started (PID: ${newWorker.process.pid})`);
      
      restartCount++;
      if (restartCount < maxRestarts * numCPUs) {
        setTimeout(restartNextWorker, 3000);
      } else {
        console.log('\n✅ Zero-downtime restart demo completed!');
        console.log('   Server is still running and handling requests.');
        console.log('\n💡 Press Ctrl+C to stop the server\n');
      }
    });
  }

  // Start restart process after 3 seconds
  setTimeout(() => {
    console.log('\n🚀 Starting zero-downtime restart sequence...\n');
    restartNextWorker();
  }, 3000);

  console.log(`\n🌍 Server running at http://localhost:${PORT}`);
  console.log(`💡 Server will restart workers one by one (watch logs)\n`);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].disconnect();
    }
    
    setTimeout(() => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      setTimeout(() => process.exit(0), 1000);
    }, 2000);
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;
  let requestCount = 0;

  const server = http.createServer((req, res) => {
    requestCount++;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Request handled during zero-downtime restart',
      workerId: workerId,
      workerPid: process.pid,
      requestNumber: requestCount,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`   ✅ Worker ${workerId} handled request #${requestCount}`);
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} listening on port ${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log(`   🛑 Worker ${workerId} received SIGTERM, closing server...`);
    server.close(() => {
      console.log(`   ✅ Worker ${workerId} server closed`);
      process.exit(0);
    });
    
    // Force exit after 10 seconds if server doesn't close
    setTimeout(() => {
      console.log(`   ⚠️  Worker ${workerId} forcing exit`);
      process.exit(1);
    }, 10000);
  });
}

