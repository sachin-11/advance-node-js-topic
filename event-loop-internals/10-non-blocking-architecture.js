// ============================================
// Example 10: Non-Blocking Architecture - Deep Dive
// ============================================
// यह example Node.js की non-blocking architecture को
// deeply explain करता है - blocking vs non-blocking operations

console.log('=== Non-Blocking Architecture - Deep Dive ===\n');

const fs = require('fs');
const crypto = require('crypto');

// ============================================
// PART 1: Understanding Blocking vs Non-Blocking
// ============================================
console.log('--- PART 1: Blocking vs Non-Blocking Concept ---\n');

console.log('🔴 BLOCKING: Code execution stops, waits for operation to complete');
console.log('🟢 NON-BLOCKING: Code continues, operation happens in background\n');

// ============================================
// PART 2: Blocking Operations (Synchronous)
// ============================================
console.log('--- PART 2: Blocking Operations (Synchronous) ---\n');

function demonstrateBlocking() {
  console.log('⏱️  Starting blocking operation...');
  const start = Date.now();
  
  // BLOCKING: This stops everything for 2 seconds
  // In real code, this could be:
  // - fs.readFileSync() - reading large file
  // - crypto.pbkdf2Sync() - heavy computation
  // - JSON.parse() on huge data
  // - Synchronous database query
  
  // Simulating blocking operation
  const end = start + 2000;
  while (Date.now() < end) {
    // Blocking the thread
  }
  
  console.log('✅ Blocking operation completed (2 seconds wasted)');
  console.log('⚠️  During this time, NO other code could run!\n');
}

console.log('Before blocking operation');
demonstrateBlocking();
console.log('After blocking operation');
console.log('Notice: Everything waited!\n');

// ============================================
// PART 3: Non-Blocking Operations (Asynchronous)
// ============================================
console.log('--- PART 3: Non-Blocking Operations (Asynchronous) ---\n');

function demonstrateNonBlocking() {
  console.log('⏱️  Starting non-blocking operation...');
  
  // NON-BLOCKING: This doesn't stop execution
  setTimeout(() => {
    console.log('✅ Non-blocking operation completed (after 2 seconds)');
    console.log('🟢 But other code continued running!\n');
  }, 2000);
  
  console.log('🟢 Code continues immediately (non-blocking!)');
}

console.log('Before non-blocking operation');
demonstrateNonBlocking();
console.log('After non-blocking operation (runs immediately!)');
console.log('Notice: Code continued without waiting!\n');

// ============================================
// PART 4: Real-World File I/O Comparison
// ============================================
console.log('--- PART 4: File I/O - Blocking vs Non-Blocking ---\n');

const testFile = __filename;

// BLOCKING File Read
console.log('🔴 BLOCKING File Read:');
console.log('1. Starting blocking read...');
try {
  const blockingStart = Date.now();
  const data = fs.readFileSync(testFile, 'utf8');
  const blockingTime = Date.now() - blockingStart;
  console.log(`2. File read completed (${blockingTime}ms)`);
  console.log(`3. File size: ${data.length} bytes`);
  console.log('⚠️  During read, nothing else could execute!\n');
} catch (err) {
  console.log('Error:', err.message);
}

// NON-BLOCKING File Read
console.log('🟢 NON-BLOCKING File Read:');
console.log('1. Starting non-blocking read...');
const nonBlockingStart = Date.now();
fs.readFile(testFile, 'utf8', (err, data) => {
  const nonBlockingTime = Date.now() - nonBlockingStart;
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log(`2. File read completed (${nonBlockingTime}ms)`);
    console.log(`3. File size: ${data.length} bytes`);
    console.log('🟢 During read, other code continued executing!\n');
  }
});
console.log('2. Code continues immediately (didn\'t wait for file read)');
console.log('3. File read happening in background...\n');

// ============================================
// PART 5: Multiple Operations - Blocking vs Non-Blocking
// ============================================
console.log('--- PART 5: Multiple Operations Comparison ---\n');

// BLOCKING: Sequential execution (slow)
console.log('🔴 BLOCKING Approach (Sequential):');
function blockingMultiple() {
  const start = Date.now();
  
  // Operation 1
  console.log('  Operation 1 starting...');
  const end1 = start + 1000;
  while (Date.now() < end1) {}
  console.log('  Operation 1 done (1s)');
  
  // Operation 2
  console.log('  Operation 2 starting...');
  const end2 = end1 + 1000;
  while (Date.now() < end2) {}
  console.log('  Operation 2 done (1s)');
  
  // Operation 3
  console.log('  Operation 3 starting...');
  const end3 = end2 + 1000;
  while (Date.now() < end3) {}
  console.log('  Operation 3 done (1s)');
  
  const total = Date.now() - start;
  console.log(`  ⏱️  Total time: ${total}ms (sequential)\n`);
}

blockingMultiple();

// NON-BLOCKING: Parallel execution (fast)
console.log('🟢 NON-BLOCKING Approach (Parallel):');
function nonBlockingMultiple() {
  const start = Date.now();
  let completed = 0;
  const totalOps = 3;
  
  function operationDone(opNum) {
    completed++;
    console.log(`  Operation ${opNum} done (1s)`);
    
    if (completed === totalOps) {
      const total = Date.now() - start;
      console.log(`  ⏱️  Total time: ${total}ms (parallel - much faster!)\n`);
    }
  }
  
  // All operations start simultaneously
  console.log('  All operations starting in parallel...');
  
  setTimeout(() => operationDone(1), 1000);
  setTimeout(() => operationDone(2), 1000);
  setTimeout(() => operationDone(3), 1000);
}

nonBlockingMultiple();

// ============================================
// PART 6: Event Loop's Role in Non-Blocking
// ============================================
console.log('--- PART 6: How Event Loop Enables Non-Blocking ---\n');

console.log('📋 Event Loop Process:');
console.log('1. Main thread executes synchronous code');
console.log('2. Async operations delegated to thread pool (libuv)');
console.log('3. Main thread continues (non-blocking!)');
console.log('4. When async operation completes, callback queued');
console.log('5. Event loop processes callback in next iteration\n');

// Demonstration
console.log('Demonstration:');
console.log('A: Synchronous code');

// These are delegated to thread pool
fs.readFile(__filename, () => {
  console.log('C: File read callback (executed by event loop)');
});

setTimeout(() => {
  console.log('D: setTimeout callback (executed by event loop)');
}, 0);

// Heavy computation - if synchronous, would block
// But we can make it non-blocking
setImmediate(() => {
  console.log('E: setImmediate callback (executed by event loop)');
});

console.log('B: Synchronous code continues (non-blocking!)');
console.log('   Event loop will handle callbacks later\n');

// ============================================
// PART 7: CPU-Intensive Tasks - The Challenge
// ============================================
console.log('--- PART 7: CPU-Intensive Tasks Challenge ---\n');

console.log('⚠️  Problem: CPU-intensive tasks can block event loop!');
console.log('Example: Heavy computation, encryption, image processing\n');

// BLOCKING CPU task
function blockingCpuTask() {
  console.log('🔴 Blocking CPU Task:');
  const start = Date.now();
  
  // Simulating heavy computation
  let result = 0;
  for (let i = 0; i < 100000000; i++) {
    result += i;
  }
  
  const time = Date.now() - start;
  console.log(`  Computation done in ${time}ms`);
  console.log('  ⚠️  Event loop was blocked during this!\n');
}

// This would block - uncomment to see
// blockingCpuTask();

// NON-BLOCKING approach: Use worker threads or break into chunks
function nonBlockingCpuTask() {
  console.log('🟢 Non-Blocking CPU Task (using setImmediate):');
  const start = Date.now();
  let result = 0;
  let i = 0;
  const max = 100000000;
  
  function chunk() {
    const chunkEnd = Math.min(i + 1000000, max);
    
    for (; i < chunkEnd; i++) {
      result += i;
    }
    
    if (i < max) {
      // Yield to event loop after each chunk
      setImmediate(chunk);
    } else {
      const time = Date.now() - start;
      console.log(`  Computation done in ${time}ms`);
      console.log('  🟢 Event loop was NOT blocked (chunked execution)!\n');
    }
  }
  
  chunk();
}

// Uncomment to see non-blocking approach
// nonBlockingCpuTask();

console.log('💡 Solution: Break CPU tasks into chunks using setImmediate()');
console.log('   Or use Worker Threads for true parallelism\n');

// ============================================
// PART 8: Real-World Server Example
// ============================================
console.log('--- PART 8: Server Performance Comparison ---\n');

console.log('🔴 BLOCKING Server (Bad):');
console.log('  Request 1 → Blocking operation (2s) → Response');
console.log('  Request 2 → Waits for Request 1 → Blocking operation (2s) → Response');
console.log('  Request 3 → Waits for Request 1 & 2 → Blocking operation (2s) → Response');
console.log('  ⏱️  Total time: 6 seconds for 3 requests\n');

console.log('🟢 NON-BLOCKING Server (Good):');
console.log('  Request 1 → Non-blocking operation (2s) → Response');
console.log('  Request 2 → Non-blocking operation (2s) → Response (parallel)');
console.log('  Request 3 → Non-blocking operation (2s) → Response (parallel)');
console.log('  ⏱️  Total time: ~2 seconds for 3 requests (3x faster!)\n');

// Simulation
console.log('Simulation:');
let requestCount = 0;

function handleRequestBlocking(reqNum) {
  requestCount++;
  console.log(`  Request ${reqNum} received`);
  
  // Simulating blocking operation
  const start = Date.now();
  const end = start + 2000;
  while (Date.now() < end) {}
  
  console.log(`  Request ${reqNum} completed (blocked for 2s)`);
  
  if (requestCount === 3) {
    const total = Date.now() - start;
    console.log(`  ⏱️  All requests handled in ${total}ms (sequential)\n`);
  }
}

// Non-blocking version
let nonBlockingCount = 0;
var nonBlockingStart;

function handleRequestNonBlocking(reqNum) {
  if (!nonBlockingStart) nonBlockingStart = Date.now();
  nonBlockingCount++;
  console.log(`  Request ${reqNum} received`);
  
  // Non-blocking operation
  setTimeout(() => {
    console.log(`  Request ${reqNum} completed (non-blocking)`);
    
    if (nonBlockingCount === 3) {
      const total = Date.now() - nonBlockingStart;
      console.log(`  ⏱️  All requests handled in ${total}ms (parallel)\n`);
    }
  }, 2000);
}

console.log('Non-blocking server handling 3 requests:');
handleRequestNonBlocking(1);
handleRequestNonBlocking(2);
handleRequestNonBlocking(3);

// ============================================
// PART 9: Key Principles
// ============================================
console.log('--- PART 9: Key Principles of Non-Blocking Architecture ---\n');

setTimeout(() => {
  console.log('📚 KEY PRINCIPLES:\n');
  
  console.log('1. ✅ Use Async APIs');
  console.log('   - fs.readFile() instead of fs.readFileSync()');
  console.log('   - setTimeout() for delays');
  console.log('   - Promises/async-await for async operations\n');
  
  console.log('2. ✅ Avoid Blocking Operations');
  console.log('   - No synchronous file I/O in production');
  console.log('   - No heavy CPU tasks on main thread');
  console.log('   - Use Worker Threads for CPU-intensive work\n');
  
  console.log('3. ✅ Leverage Event Loop');
  console.log('   - Event loop handles I/O efficiently');
  console.log('   - Callbacks execute when operations complete');
  console.log('   - Main thread stays free for new requests\n');
  
  console.log('4. ✅ Break Long Tasks');
  console.log('   - Use setImmediate() to yield to event loop');
  console.log('   - Process data in chunks');
  console.log('   - Keep event loop responsive\n');
  
  console.log('5. ✅ Understand Thread Pool');
  console.log('   - libuv thread pool handles file I/O');
  console.log('   - Default: 4 threads (configurable)');
  console.log('   - Network I/O uses OS async mechanisms\n');
  
  console.log('🎯 BENEFITS:');
  console.log('   • High concurrency');
  console.log('   • Better resource utilization');
  console.log('   • Responsive applications');
  console.log('   • Can handle thousands of connections\n');
}, 100);

// ============================================
// PART 10: Common Patterns
// ============================================
console.log('\n--- PART 10: Common Non-Blocking Patterns ---\n');

// Pattern 1: Callbacks
console.log('Pattern 1: Callbacks');
fs.readFile(__filename, 'utf8', (err, data) => {
  if (err) {
    console.log('  Error:', err.message);
  } else {
    console.log('  ✅ File read via callback (non-blocking)');
  }
});

// Pattern 2: Promises
console.log('\nPattern 2: Promises');
const fsPromises = require('fs').promises;
fsPromises.readFile(__filename, 'utf8')
  .then(data => {
    console.log('  ✅ File read via Promise (non-blocking)');
  })
  .catch(err => {
    console.log('  Error:', err.message);
  });

// Pattern 3: async/await
console.log('\nPattern 3: async/await');
(async () => {
  try {
    const data = await fsPromises.readFile(__filename, 'utf8');
    console.log('  ✅ File read via async/await (non-blocking)');
  } catch (err) {
    console.log('  Error:', err.message);
  }
})();

// Pattern 4: Event Emitters
console.log('\nPattern 4: Event Emitters');
const { EventEmitter } = require('events');
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  console.log('  ✅ Data received via events (non-blocking)');
});

setTimeout(() => {
  emitter.emit('data', 'some data');
}, 100);

console.log('\nAll patterns are non-blocking!');

/*
============================================
SUMMARY: Non-Blocking Architecture
============================================

🔴 BLOCKING:
- Synchronous operations
- Stops execution until complete
- Blocks event loop
- Poor performance
- Examples: readFileSync, pbkdf2Sync

🟢 NON-BLOCKING:
- Asynchronous operations
- Continues execution immediately
- Doesn't block event loop
- Excellent performance
- Examples: readFile, setTimeout, Promises

KEY MECHANISMS:
1. Event Loop - manages async operations
2. Thread Pool (libuv) - handles file I/O
3. OS Async I/O - network operations
4. Callbacks/Promises - handle completion

BEST PRACTICES:
✅ Always use async APIs
✅ Avoid blocking operations
✅ Break CPU tasks into chunks
✅ Use Worker Threads for heavy computation
✅ Keep event loop responsive

Node.js is designed for I/O-intensive, non-blocking operations!
This is why it excels at building servers, APIs, and real-time applications.
*/

