// ============================================
// Example 2: 1000 Concurrent Requests Simulation
// ============================================
// Ye example Promise.all use karke 1000 concurrent requests simulate karta hai
// Blocking aur non-blocking code ka impact dikhata hai

import http from 'http';

const TOTAL_REQUESTS = 1000;
const PORT = 3011;

console.log('='.repeat(60));
console.log('🌊 1000 Concurrent Requests Simulation');
console.log('='.repeat(60));
console.log(`📊 Total Concurrent Requests: ${TOTAL_REQUESTS}\n`);

// ============================================
// BLOCKING TASK (CPU-intensive)
// ============================================
function blockingTask(iterations = 1000000) {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i) * Math.cos(i);
  }
  return sum;
}

// ============================================
// NON-BLOCKING TASK (Async)
// ============================================
function nonBlockingTask() {
  return new Promise((resolve) => {
    // Simulate async I/O operation
    setImmediate(() => {
      resolve({ completed: true, timestamp: Date.now() });
    });
  });
}

// ============================================
// TEST SCENARIO 1: BLOCKING HANDLER
// ============================================
const blockingServer = http.createServer((req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  // ❌ BLOCKING: Event loop block ho jata hai
  blockingTask(1000000);
  
  const processingTime = Date.now() - startTime;
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'X-Request-ID': requestId
  });
  res.end(JSON.stringify({
    type: 'blocking',
    requestId,
    processingTime: `${processingTime}ms`,
    message: 'Handled by blocking server'
  }));
});

blockingServer.listen(PORT, () => {
  console.log(`🔴 BLOCKING Server listening on port ${PORT}`);
  runBlockingTest();
});

async function runBlockingTest() {
  console.log('\n📊 Running BLOCKING test with 1000 concurrent requests...\n');
  
  const startTime = Date.now();
  const requests = [];
  
  // Create 1000 concurrent requests using Promise.all
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    requests.push(
      new Promise((resolve, reject) => {
        const requestStart = Date.now();
        
        const req = http.get(`http://localhost:${PORT}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const requestTime = Date.now() - requestStart;
            try {
              const parsed = JSON.parse(data);
              resolve({
                success: true,
                requestNumber: i + 1,
                requestTime,
                serverTime: parsed.processingTime,
                requestId: parsed.requestId
              });
            } catch (e) {
              resolve({
                success: false,
                requestNumber: i + 1,
                error: 'Parse error'
              });
            }
          });
        });
        
        req.on('error', (err) => {
          resolve({
            success: false,
            requestNumber: i + 1,
            error: err.message
          });
        });
        
        req.setTimeout(60000, () => {
          req.destroy();
          resolve({
            success: false,
            requestNumber: i + 1,
            error: 'Timeout'
          });
        });
      })
    );
  }
  
  console.log(`⏳ Sending ${TOTAL_REQUESTS} concurrent requests...`);
  console.log(`   (This may take a while due to blocking code)\n`);
  
  try {
    // Wait for all requests to complete
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const responseTimes = results
      .filter(r => r.success)
      .map(r => r.requestTime);
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    
    console.log('='.repeat(60));
    console.log('📊 BLOCKING SERVER RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successful}/${TOTAL_REQUESTS}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`📈 Throughput: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)} requests/second`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⬇️  Min Response Time: ${minResponseTime}ms`);
    console.log(`⬆️  Max Response Time: ${maxResponseTime}ms`);
    
    // Show first 5 successful requests
    console.log(`\n📋 Sample Results (first 5):`);
    results
      .filter(r => r.success)
      .slice(0, 5)
      .forEach(r => {
        console.log(`   Request #${r.requestNumber}: ${r.requestTime}ms`);
      });
    
    console.log(`\n💡 Key Observation:`);
    console.log(`   Blocking code se event loop block hota hai,`);
    console.log(`   isliye requests sequentially process hote hain.`);
    console.log(`   Throughput bahut kam hota hai!`);
    
    // Cleanup
    blockingServer.close(() => {
      console.log('\n✅ Server closed\n');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    blockingServer.close();
    process.exit(1);
  }
}

