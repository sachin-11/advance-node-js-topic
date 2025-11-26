// ============================================
// Example 7: Performance Comparison
// ============================================
// Ye example dikhata hai ki clustering se performance kaise improve hoti hai
// Single process vs Clustered process comparison

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3005;
const TEST_PORT = 3006; // For single process test

// Simulate CPU-intensive work
function doWork(iterations = 1000000) {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }
  return sum;
}

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('⚡ Performance Comparison: Single vs Clustered');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}\n`);

  // Start single process server for comparison
  console.log('🔵 Starting SINGLE process server...');
  const singleServer = http.createServer((req, res) => {
    const startTime = Date.now();
    doWork(500000); // CPU work
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type: 'single-process',
      processingTime: Date.now() - startTime,
      pid: process.pid
    }));
  });

  singleServer.listen(TEST_PORT, () => {
    console.log(`   ✅ Single process server running on port ${TEST_PORT}\n`);
  });

  // Start clustered server
  console.log('🟢 Starting CLUSTERED server...');
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  console.log(`\n🌍 Test Servers:`);
  console.log(`   Single:  http://localhost:${TEST_PORT}`);
  console.log(`   Cluster: http://localhost:${PORT}`);
  console.log(`\n💡 Performance Test:`);
  console.log(`   Run this command to test both servers:`);
  console.log(`   time curl http://localhost:${TEST_PORT} && time curl http://localhost:${PORT}`);
  console.log(`\n📊 Or use Apache Bench:`);
  console.log(`   ab -n 100 -c 10 http://localhost:${TEST_PORT}/  # Single process`);
  console.log(`   ab -n 100 -c 10 http://localhost:${PORT}/        # Clustered\n`);

  // Demo: Send concurrent requests
  console.log('🚀 Sending 10 concurrent requests to both servers...\n');

  async function testServer(port, name) {
    const times = [];
    const promises = [];

    for (let i = 0; i < 10; i++) {
      const promise = new Promise((resolve) => {
        const start = Date.now();
        const req = http.get(`http://localhost:${port}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            times.push(Date.now() - start);
            resolve();
          });
        });
        req.on('error', () => resolve());
      });
      promises.push(promise);
    }

    await Promise.all(promises);
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`📊 ${name} Results:`);
    console.log(`   Requests: 10`);
    console.log(`   Average:  ${avg.toFixed(2)}ms`);
    console.log(`   Min:      ${min}ms`);
    console.log(`   Max:      ${max}ms`);
    console.log('');
  }

  setTimeout(async () => {
    await testServer(TEST_PORT, 'Single Process');
    await testServer(PORT, 'Clustered');
    
    console.log('💡 Clustered server distributes load across workers,');
    console.log('   resulting in better throughput under load!\n');
  }, 2000);

  cluster.on('exit', (worker) => {
    cluster.fork();
  });

  // Cleanup
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    singleServer.close();
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    setTimeout(() => process.exit(0), 1000);
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;

  const server = http.createServer((req, res) => {
    const startTime = Date.now();
    
    // Same CPU work as single process
    doWork(500000);
    
    const processingTime = Date.now() - startTime;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type: 'clustered',
      workerId: workerId,
      workerPid: process.pid,
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    }));
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} ready (PID: ${process.pid})`);
  });
}

