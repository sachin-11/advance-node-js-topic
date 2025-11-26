// ============================================
// Example 2: HTTP Server with Clustering
// ============================================
// Ye example dikhata hai ki HTTP server ko kaise cluster mein run karte hain
// Multiple requests ko different workers handle karte hain

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3000;

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🌐 HTTP Server Clustering Example');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}`);
  console.log(`🚀 Starting ${numCPUs} workers...\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`✨ Worker ${worker.id} started (PID: ${worker.process.pid})`);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`\n⚠️  Worker ${worker.id} died. Restarting...`);
    const newWorker = cluster.fork();
    console.log(`✨ New Worker ${newWorker.id} started`);
  });

  console.log(`\n🌍 Server running at http://localhost:${PORT}`);
  console.log(`💡 Try: curl http://localhost:${PORT} (multiple times to see different workers)\n`);

} else {
  // Worker process - HTTP server
  const server = http.createServer((req, res) => {
    const workerId = cluster.worker.id;
    const workerPid = process.pid;
    
    // Simulate some processing time
    const startTime = Date.now();
    
    // Simulate some async work (like database query)
    setTimeout(() => {
      const processingTime = Date.now() - startTime;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Hello from clustered server!',
        workerId: workerId,
        workerPid: workerPid,
        timestamp: new Date().toISOString(),
        processingTime: `${processingTime}ms`,
        url: req.url
      }, null, 2));
      
      console.log(`   ✅ Worker ${workerId} handled request: ${req.method} ${req.url} (${processingTime}ms)`);
    }, Math.random() * 100); // Random delay 0-100ms
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${cluster.worker.id} listening on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error(`   ❌ Worker ${cluster.worker.id} error:`, err.message);
  });
}

