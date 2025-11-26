// ============================================
// Example 1: Blocking vs Non-Blocking Code
// ============================================
// Ye example dikhata hai ki blocking code throughput ko kaise affect karta hai

import http from 'http';

const PORT = 3009;
const TOTAL_REQUESTS = 100;

// ============================================
// BLOCKING CODE (Synchronous)
// ============================================
function blockingTask(iterations = 10000000) {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }
  return sum;
}

// ============================================
// NON-BLOCKING CODE (Asynchronous)
// ============================================
function nonBlockingTask(delay = 10) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Task completed');
    }, delay);
  });
}

console.log('='.repeat(60));
console.log('🚦 Blocking vs Non-Blocking Code - Throughput Comparison');
console.log('='.repeat(60));
console.log(`📊 Total Requests: ${TOTAL_REQUESTS}\n`);

// ============================================
// SERVER 1: BLOCKING SERVER
// ============================================
const blockingServer = http.createServer((req, res) => {
  const startTime = Date.now();
  
  // ❌ BLOCKING: Ye code event loop ko block karega
  blockingTask(5000000); // CPU-intensive synchronous work
  
  const processingTime = Date.now() - startTime;
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    type: 'blocking',
    message: 'Request handled (BLOCKING)',
    processingTime: `${processingTime}ms`,
    timestamp: new Date().toISOString()
  }));
});

blockingServer.listen(3009, () => {
  console.log('🔴 BLOCKING Server running on port 3009');
  console.log('   ⚠️  This server uses SYNCHRONOUS blocking code\n');
});

// ============================================
// SERVER 2: NON-BLOCKING SERVER
// ============================================
const nonBlockingServer = http.createServer(async (req, res) => {
  const startTime = Date.now();
  
  // ✅ NON-BLOCKING: Ye code event loop ko block nahi karega
  await nonBlockingTask(10); // Asynchronous work
  
  const processingTime = Date.now() - startTime;
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    type: 'non-blocking',
    message: 'Request handled (NON-BLOCKING)',
    processingTime: `${processingTime}ms`,
    timestamp: new Date().toISOString()
  }));
});

nonBlockingServer.listen(3010, () => {
  console.log('🟢 NON-BLOCKING Server running on port 3010');
  console.log('   ✅ This server uses ASYNCHRONOUS non-blocking code\n');
});

// ============================================
// PERFORMANCE TEST
// ============================================
async function testThroughput(port, name, type) {
  console.log(`\n🚀 Testing ${name}...`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  const requests = [];
  
  // Create 100 concurrent requests
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    requests.push(
      new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(data),
              requestNumber: i + 1
            });
          });
        });
        
        req.on('error', reject);
        req.setTimeout(30000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      })
    );
  }
  
  try {
    // Wait for all requests to complete
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successful = results.filter(r => r.statusCode === 200).length;
    const failed = TOTAL_REQUESTS - successful;
    
    const avgResponseTime = results.reduce((sum, r) => {
      return sum + parseInt(r.data.processingTime);
    }, 0) / results.length;
    
    console.log(`✅ Completed: ${successful}/${TOTAL_REQUESTS} requests`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📈 Throughput: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)} requests/second`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`❌ Failed: ${failed}`);
    
    return {
      name,
      totalTime,
      throughput: TOTAL_REQUESTS / (totalTime / 1000),
      avgResponseTime,
      successful,
      failed
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${name}:`, error.message);
    return null;
  }
}

// Run tests after 2 seconds
setTimeout(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE COMPARISON');
  console.log('='.repeat(60));
  
  // Test blocking server
  const blockingResult = await testThroughput(3009, 'BLOCKING Server', 'blocking');
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test non-blocking server
  const nonBlockingResult = await testThroughput(3010, 'NON-BLOCKING Server', 'non-blocking');
  
  // Compare results
  if (blockingResult && nonBlockingResult) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPARISON RESULTS');
    console.log('='.repeat(60));
    console.log(`\n🔴 BLOCKING Server:`);
    console.log(`   Throughput: ${blockingResult.throughput.toFixed(2)} req/sec`);
    console.log(`   Avg Response: ${blockingResult.avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${blockingResult.totalTime}ms`);
    
    console.log(`\n🟢 NON-BLOCKING Server:`);
    console.log(`   Throughput: ${nonBlockingResult.throughput.toFixed(2)} req/sec`);
    console.log(`   Avg Response: ${nonBlockingResult.avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${nonBlockingResult.totalTime}ms`);
    
    const improvement = ((nonBlockingResult.throughput / blockingResult.throughput) * 100 - 100).toFixed(2);
    console.log(`\n💡 Improvement: ${improvement}% faster throughput`);
    console.log(`\n🎯 Key Takeaway:`);
    console.log(`   Blocking code event loop ko block karta hai,`);
    console.log(`   isliye throughput kam hota hai.`);
    console.log(`   Non-blocking code zyada requests handle kar sakta hai!`);
  }
  
  // Shutdown servers
  console.log('\n\n🛑 Shutting down servers...');
  blockingServer.close();
  nonBlockingServer.close();
  setTimeout(() => {
    console.log('✅ Servers closed\n');
    process.exit(0);
  }, 1000);
  
}, 2000);

console.log('\n💡 Wait 2 seconds for servers to start, then tests will begin...\n');

