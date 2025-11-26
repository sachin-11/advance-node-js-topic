// ============================================
// Example 1: Basic Clustering Setup
// ============================================
// Ye example dikhata hai ki Node.js mein clustering kaise setup karte hain

import cluster from 'cluster';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Total CPU cores available
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🚀 Basic Clustering Example');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}\n`);

  // Fork workers for each CPU core
  console.log('⚙️  Creating worker processes...\n');
  
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    
    console.log(`✨ Worker ${worker.id} started (PID: ${worker.process.pid})`);
    
    // Listen for messages from workers
    worker.on('message', (msg) => {
      console.log(`📨 Message from Worker ${worker.id}: ${msg}`);
    });
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`\n⚠️  Worker ${worker.id} (PID: ${worker.process.pid}) exited`);
    console.log(`   Exit code: ${code}, Signal: ${signal}`);
    
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(`   🔄 Restarting worker...\n`);
      const newWorker = cluster.fork();
      console.log(`✨ New Worker ${newWorker.id} started (PID: ${newWorker.process.pid})`);
    }
  });

  // Send message to all workers after 2 seconds
  setTimeout(() => {
    console.log('\n📤 Master sending message to all workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].send(`Hello from Master! Time: ${new Date().toLocaleTimeString()}`);
    }
  }, 2000);

  // Exit after 5 seconds
  setTimeout(() => {
    console.log('\n\n🛑 Shutting down all workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    setTimeout(() => {
      console.log('✅ All workers stopped. Master exiting.\n');
      process.exit(0);
    }, 1000);
  }, 5000);

} else {
  // Worker process
  const workerId = cluster.worker.id;
  const workerPid = process.pid;
  
  console.log(`   👷 Worker ${workerId} (PID: ${workerPid}) is running`);
  
  // Listen for messages from master
  process.on('message', (msg) => {
    console.log(`   📬 Worker ${workerId} received: ${msg}`);
    // Send response back to master
    process.send(`Worker ${workerId} received your message!`);
  });

  // Simulate some work
  setInterval(() => {
    // Workers can do some periodic work
    // console.log(`   Worker ${workerId} is working...`);
  }, 1000);
}

