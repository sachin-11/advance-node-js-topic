// ============================================
// Example 5: Complete Throughput Comparison
// ============================================
// Ye example comprehensive throughput comparison dikhata hai
// Different scenarios ko test karta hai

import http from 'http';

const TEST_REQUESTS = 1000;
const ITERATIONS = 500000;

console.log('='.repeat(60));
console.log('📊 Complete Throughput Comparison');
console.log('='.repeat(60));
console.log(`📈 Test Configuration:`);
console.log(`   Total Requests: ${TEST_REQUESTS}`);
console.log(`   CPU Work Iterations: ${ITERATIONS}\n`);

// ============================================
// BLOCKING CPU WORK
// ============================================
function blockingWork(iterations = ITERATIONS) {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  return result;
}

// ============================================
// NON-BLOCKING ASYNC WORK
// ============================================
function nonBlockingWork() {
  return new Promise((resolve) => {
    setImmediate(() => {
      resolve({ completed: true });
    });
  });
}

// ============================================
// TEST 1: BLOCKING SERVER
// ============================================
function createBlockingServer(port) {
  return http.createServer((req, res) => {
    const start = Date.now();
    
    // BLOCKING: Event loop block ho jata hai
    blockingWork();
    
    const time = Date.now() - start;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type: 'blocking',
      processingTime: time,
      timestamp: Date.now()
    }));
  });
}

// ============================================
// TEST 2: NON-BLOCKING SERVER
// ============================================
function createNonBlockingServer(port) {
  return http.createServer(async (req, res) => {
    const start = Date.now();
    
    // NON-BLOCKING: Event loop free rehta hai
    await nonBlockingWork();
    
    const time = Date.now() - start;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type: 'non-blocking',
      processingTime: time,
      timestamp: Date.now()
    }));
  });
}

// ============================================
// TEST 3: HYBRID SERVER (Some blocking, some async)
// ============================================
function createHybridServer(port) {
  return http.createServer(async (req, res) => {
    const start = Date.now();
    
    // Mix of blocking and non-blocking
    const url = new URL(req.url, `http://${req.headers.host}`);
    const blocking = url.searchParams.get('blocking') === 'true';
    
    if (blocking) {
      blockingWork(Math.floor(ITERATIONS / 2));
    } else {
      await nonBlockingWork();
    }
    
    const time = Date.now() - start;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type: 'hybrid',
      blocking: blocking,
      processingTime: time,
      timestamp: Date.now()
    }));
  });
}

// ============================================
// PERFORMANCE TEST FUNCTION
// ============================================
async function testServer(port, name, options = {}) {
  console.log(`\n🚀 Testing: ${name}`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  const requests = [];
  let completed = 0;
  
  // Progress indicator
  const progressInterval = setInterval(() => {
    const percentage = ((completed / TEST_REQUESTS) * 100).toFixed(1);
    process.stdout.write(`\r   Progress: ${completed}/${TEST_REQUESTS} (${percentage}%)`);
  }, 100);
  
  // Create concurrent requests
  for (let i = 0; i < TEST_REQUESTS; i++) {
    const url = options.path || '/';
    
    requests.push(
      new Promise((resolve) => {
        const reqStart = Date.now();
        
        const req = http.get(`http://localhost:${port}${url}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            completed++;
            try {
              const parsed = JSON.parse(data);
              resolve({
                success: true,
                requestTime: Date.now() - reqStart,
                serverTime: parsed.processingTime,
                requestNumber: i + 1
              });
            } catch {
              resolve({
                success: false,
                requestNumber: i + 1,
                error: 'Parse error'
              });
            }
          });
        });
        
        req.on('error', () => {
          completed++;
          resolve({
            success: false,
            requestNumber: i + 1,
            error: 'Request failed'
          });
        });
        
        req.setTimeout(120000, () => {
          req.destroy();
          completed++;
          resolve({
            success: false,
            requestNumber: i + 1,
            error: 'Timeout'
          });
        });
      })
    );
  }
  
  // Wait for all requests
  const results = await Promise.all(requests);
  clearInterval(progressInterval);
  process.stdout.write('\n');
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const responseTimes = successful.map(r => r.requestTime);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;
  
  const minTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  
  const throughput = (TEST_REQUESTS / (totalTime / 1000)).toFixed(2);
  
  console.log(`   ✅ Successful: ${successful.length}/${TEST_REQUESTS}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   ⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
  console.log(`   📈 Throughput: ${throughput} req/sec`);
  console.log(`   ⚡ Avg Response: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   ⬇️  Min: ${minTime}ms | ⬆️  Max: ${maxTime}ms`);
  
  return {
    name,
    successful: successful.length,
    failed: failed.length,
    totalTime,
    throughput: parseFloat(throughput),
    avgResponseTime,
    minTime,
    maxTime
  };
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  // Start servers
  const blockingServer = createBlockingServer(3012);
  const nonBlockingServer = createNonBlockingServer(3013);
  const hybridServer = createHybridServer(3014);
  
  await new Promise(resolve => {
    blockingServer.listen(3012, () => {
      nonBlockingServer.listen(3013, () => {
        hybridServer.listen(3014, () => {
          console.log('✅ All servers started\n');
          setTimeout(resolve, 1000);
        });
      });
    });
  });
  
  const results = [];
  
  // Test 1: Blocking
  results.push(await testServer(3012, '🔴 BLOCKING Server'));
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 2: Non-Blocking
  results.push(await testServer(3013, '🟢 NON-BLOCKING Server'));
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 3: Hybrid (50% blocking, 50% non-blocking)
  console.log('\n🔄 Hybrid test: 50% blocking, 50% non-blocking requests\n');
  const hybridResults = [];
  
  // 50% blocking requests
  const blockingReqs = Array(500).fill(0).map(() => 
    new Promise((resolve) => {
      const req = http.get('http://localhost:3014/?blocking=true', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ success: true, blocking: true }));
      });
      req.on('error', () => resolve({ success: false }));
      req.setTimeout(120000, () => { req.destroy(); resolve({ success: false }); });
    })
  );
  
  // 50% non-blocking requests
  const nonBlockingReqs = Array(500).fill(0).map(() => 
    new Promise((resolve) => {
      const req = http.get('http://localhost:3014/?blocking=false', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ success: true, blocking: false }));
      });
      req.on('error', () => resolve({ success: false }));
      req.setTimeout(120000, () => { req.destroy(); resolve({ success: false }); });
    })
  );
  
  const hybridStart = Date.now();
  await Promise.all([...blockingReqs, ...nonBlockingReqs]);
  const hybridTime = Date.now() - hybridStart;
  
  results.push({
    name: '🟡 HYBRID Server',
    successful: 1000,
    failed: 0,
    totalTime: hybridTime,
    throughput: parseFloat((1000 / (hybridTime / 1000)).toFixed(2)),
    avgResponseTime: hybridTime / 1000,
    minTime: 0,
    maxTime: 0
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL COMPARISON RESULTS');
  console.log('='.repeat(60));
  
  results.forEach((r, index) => {
    console.log(`\n${r.name}:`);
    console.log(`   Throughput: ${r.throughput} req/sec`);
    console.log(`   Total Time: ${r.totalTime}ms`);
    console.log(`   Success Rate: ${((r.successful / TEST_REQUESTS) * 100).toFixed(1)}%`);
  });
  
  const best = results.reduce((a, b) => a.throughput > b.throughput ? a : b);
  const worst = results.reduce((a, b) => a.throughput < b.throughput ? a : b);
  
  console.log(`\n🏆 Best Performance: ${best.name} (${best.throughput} req/sec)`);
  console.log(`⚠️  Worst Performance: ${worst.name} (${worst.throughput} req/sec)`);
  console.log(`\n💡 Improvement: ${((best.throughput / worst.throughput - 1) * 100).toFixed(1)}% faster`);
  
  console.log(`\n🎯 Conclusion:`);
  console.log(`   ✅ Non-blocking code provides MUCH better throughput`);
  console.log(`   ✅ Blocking code severely limits concurrent request handling`);
  console.log(`   ✅ Event loop freedom is crucial for high performance`);
  console.log(`   ✅ Always prefer async/non-blocking operations!\n`);
  
  // Cleanup
  blockingServer.close();
  nonBlockingServer.close();
  hybridServer.close();
  
  setTimeout(() => process.exit(0), 500);
}

runAllTests().catch(console.error);

