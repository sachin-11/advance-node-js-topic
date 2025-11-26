// ============================================
// Example 6: Shared State Management
// ============================================
// Ye example dikhata hai ki workers ke beech mein state kaise share karte hain
// IPC (Inter-Process Communication) use karke

import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3004;

// Shared state (in master process)
let sharedCounter = 0;
let requestHistory = [];

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🔄 Shared State Management');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}`);
  console.log(`\n💡 Master process maintains shared state`);
  console.log(`   Workers communicate with master via IPC\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    
    // Listen to messages from workers
    worker.on('message', (msg) => {
      if (msg.type === 'increment') {
        sharedCounter++;
        // Notify all workers about updated counter
        for (const id in cluster.workers) {
          cluster.workers[id].send({
            type: 'counter-update',
            value: sharedCounter
          });
        }
      } else if (msg.type === 'add-history') {
        requestHistory.push({
          workerId: msg.workerId,
          timestamp: msg.timestamp,
          url: msg.url
        });
        // Keep only last 50 entries
        if (requestHistory.length > 50) {
          requestHistory.shift();
        }
      } else if (msg.type === 'get-state') {
        // Send state to requesting worker
        worker.send({
          type: 'state-response',
          counter: sharedCounter,
          history: requestHistory
        });
      }
    });
  }

  console.log(`🌍 Server running at http://localhost:${PORT}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   GET /counter - Get shared counter value`);
  console.log(`   GET /increment - Increment shared counter`);
  console.log(`   GET /history - Get request history`);
  console.log(`   GET /state - Get full shared state\n`);

  // Display state periodically
  setInterval(() => {
    console.log(`\n📊 Current Shared State:`);
    console.log(`   Counter: ${sharedCounter}`);
    console.log(`   History entries: ${requestHistory.length}`);
  }, 5000);

  cluster.on('exit', (worker) => {
    console.log(`\n⚠️  Worker ${worker.id} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Worker process
  const workerId = cluster.worker.id;
  let localCounter = 0; // Local counter for this worker

  // Helper function to request state from master
  function requestStateFromMaster() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ counter: 0, history: [] });
      }, 1000);
      
      const handler = (msg) => {
        if (msg.type === 'state-response') {
          clearTimeout(timeout);
          process.removeListener('message', handler);
          resolve(msg);
        }
      };
      
      process.on('message', handler);
      process.send({ type: 'get-state' });
    });
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url.pathname === '/counter') {
      // Request current state from master
      const state = await requestStateFromMaster();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sharedCounter: state.counter,
        localCounter: localCounter,
        workerId: workerId,
        workerPid: process.pid,
        timestamp: new Date().toISOString()
      }, null, 2));

    } else if (url.pathname === '/increment') {
      // Increment shared counter via master
      process.send({ 
        type: 'increment',
        workerId: workerId
      });
      
      localCounter++;
      
      // Add to history
      process.send({
        type: 'add-history',
        workerId: workerId,
        timestamp: new Date().toISOString(),
        url: req.url
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Counter incremented',
        sharedCounter: 'updating...',
        localCounter: localCounter,
        workerId: workerId,
        workerPid: process.pid,
        timestamp: new Date().toISOString()
      }, null, 2));

    } else if (url.pathname === '/history') {
      const state = await requestStateFromMaster();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        history: state.history,
        count: state.history.length,
        workerId: workerId,
        timestamp: new Date().toISOString()
      }, null, 2));

    } else if (url.pathname === '/state') {
      const state = await requestStateFromMaster();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sharedCounter: state.counter,
        requestHistory: state.history,
        workerId: workerId,
        workerPid: process.pid,
        timestamp: new Date().toISOString()
      }, null, 2));

    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Not found',
        availableEndpoints: ['/counter', '/increment', '/history', '/state']
      }, null, 2));
    }
  });

  // Listen for counter updates from master
  process.on('message', (msg) => {
    if (msg.type === 'counter-update') {
      // Worker can react to counter updates if needed
      // console.log(`   Worker ${workerId} received counter update: ${msg.value}`);
    }
  });

  server.listen(PORT, () => {
    console.log(`   👷 Worker ${workerId} ready (PID: ${process.pid})`);
  });
}

