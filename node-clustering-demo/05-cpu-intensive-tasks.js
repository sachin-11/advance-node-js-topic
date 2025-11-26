// ============================================
// Example 5: CPU-Intensive Task Distribution
// ============================================
// Ye example dikhata hai ki CPU-intensive tasks ko kaise distribute karte hain
// Clustering se heavy computation tasks parallel mein run hote hain

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3003;

// CPU-intensive task: Calculate Fibonacci number
function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// CPU-intensive task: Calculate prime numbers
function findPrimes(max) {
  const primes = [];
  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('💻 CPU-Intensive Task Distribution');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}`);
  console.log(`\n💡 Clustering helps distribute CPU-intensive tasks`);
  console.log(`   Each worker can use one full CPU core\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  console.log(`🌍 Server running at http://localhost:${PORT}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   GET /fibonacci?n=40 - Calculate Fibonacci (CPU intensive)`);
  console.log(`   GET /primes?max=10000 - Find primes up to max (CPU intensive)`);
  console.log(`   GET /status - Server status\n`);

  cluster.on('exit', (worker) => {
    console.log(`\n⚠️  Worker ${worker.id} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const startTime = Date.now();
    let result;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url.pathname === '/fibonacci') {
      const n = parseInt(url.searchParams.get('n') || '40');
      
      console.log(`   🔢 Worker ${workerId} calculating Fibonacci(${n})...`);
      result = fibonacci(n);
      
      const processingTime = Date.now() - startTime;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        task: 'fibonacci',
        input: n,
        result: result,
        workerId: workerId,
        workerPid: process.pid,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`   ✅ Worker ${workerId} completed Fibonacci(${n}) = ${result} in ${processingTime}ms`);

    } else if (url.pathname === '/primes') {
      const max = parseInt(url.searchParams.get('max') || '10000');
      
      console.log(`   🔢 Worker ${workerId} finding primes up to ${max}...`);
      const primes = findPrimes(max);
      
      const processingTime = Date.now() - startTime;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        task: 'primes',
        input: max,
        result: {
          count: primes.length,
          primes: primes.slice(0, 20), // Show first 20
          allPrimes: primes // Full list
        },
        workerId: workerId,
        workerPid: process.pid,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`   ✅ Worker ${workerId} found ${primes.length} primes in ${processingTime}ms`);

    } else if (url.pathname === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        workerId: workerId,
        workerPid: process.pid,
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }, null, 2));

    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Not found',
        availableEndpoints: ['/fibonacci?n=40', '/primes?max=10000', '/status']
      }, null, 2));
    }
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} ready (PID: ${process.pid})`);
  });
}

