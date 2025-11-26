// ============================================
// Example 3: Load Balancing Demonstration
// ============================================
// Ye example dikhata hai ki Node.js automatically load balancing kaise karta hai
// Round-robin algorithm use hota hai by default

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3001;

// Track requests per worker
const workerStats = {};

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('⚖️  Load Balancing Demonstration');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}`);
  console.log(`\n💡 Node.js uses ROUND-ROBIN load balancing by default`);
  console.log(`   Each request goes to next available worker in sequence\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workerStats[worker.id] = { requests: 0, pid: worker.process.pid };
    console.log(`✨ Worker ${worker.id} started (PID: ${worker.process.pid})`);
    
    // Listen for messages from worker
    worker.on('message', (msg) => {
      if (msg.type === 'request' && workerStats[worker.id]) {
        workerStats[worker.id].requests++;
      }
    });
  }

  // Display stats periodically
  const statsInterval = setInterval(() => {
    console.log('\n📊 Load Distribution Stats:');
    console.log('─'.repeat(60));
    for (const [workerId, stats] of Object.entries(workerStats)) {
      const bar = '█'.repeat(Math.floor(stats.requests / 5));
      console.log(`   Worker ${workerId}: ${stats.requests.toString().padStart(3)} requests ${bar}`);
    }
    console.log('─'.repeat(60));
  }, 3000);

  cluster.on('exit', (worker) => {
    console.log(`\n⚠️  Worker ${worker.id} died. Restarting...`);
    const newWorker = cluster.fork();
    workerStats[newWorker.id] = { requests: 0, pid: newWorker.process.pid };
    console.log(`✨ New Worker ${newWorker.id} started`);
    
    // Listen for messages from new worker
    newWorker.on('message', (msg) => {
      if (msg.type === 'request' && workerStats[newWorker.id]) {
        workerStats[newWorker.id].requests++;
      }
    });
  });

  console.log(`\n🌍 Server running at http://localhost:${PORT}`);
  console.log(`💡 Send multiple requests to see load distribution:`);
  console.log(`   for i in {1..20}; do curl -s http://localhost:${PORT} | grep workerId; done\n`);

  // Cleanup on exit
  process.on('SIGINT', () => {
    clearInterval(statsInterval);
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    setTimeout(() => process.exit(0), 1000);
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;
  let localRequestCount = 0;

  const server = http.createServer((req, res) => {
    // Increment local counter and notify master
    localRequestCount++;
    process.send({ type: 'request', workerId });

    const startTime = Date.now();
    
    // Simulate work
    setTimeout(() => {
      const processingTime = Date.now() - startTime;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Request handled by worker',
        workerId: workerId,
        workerPid: process.pid,
        requestNumber: localRequestCount,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`   📥 Worker ${workerId} handled request #${localRequestCount}`);
    }, 50);
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} ready on port ${PORT}`);
  });
}

