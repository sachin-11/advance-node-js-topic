// ============================================
// Example 9: Microtask vs Macrotask - Complete Comparison
// ============================================
// यह example microtasks और macrotasks के बीच का difference
// और execution order को clearly demonstrate करता है

console.log('=== Microtask vs Macrotask - Complete Comparison ===\n');

// ============================================
// PART 1: Basic Difference
// ============================================
console.log('--- PART 1: Basic Execution Order ---\n');

console.log('1️⃣ Synchronous Code (runs first)');

// MACROTASKS (lower priority)
setTimeout(() => {
  console.log('4️⃣ setTimeout (MACROTASK)');
}, 0);

setImmediate(() => {
  console.log('5️⃣ setImmediate (MACROTASK)');
});

// MICROTASKS (higher priority)
Promise.resolve().then(() => {
  console.log('2️⃣ Promise.then (MICROTASK)');
});

process.nextTick(() => {
  console.log('2️⃣ process.nextTick (MICROTASK - highest priority)');
});

queueMicrotask(() => {
  console.log('3️⃣ queueMicrotask (MICROTASK)');
});

console.log('1️⃣ Synchronous Code (continues)');

// ============================================
// PART 2: Priority Order - Microtasks First
// ============================================
console.log('\n--- PART 2: Microtasks Execute Before Macrotasks ---\n');

console.log('Start');

setTimeout(() => {
  console.log('Macrotask: setTimeout');
}, 0);

setImmediate(() => {
  console.log('Macrotask: setImmediate');
});

Promise.resolve().then(() => {
  console.log('Microtask: Promise.then');
  
  // Even nested microtasks execute before macrotasks
  Promise.resolve().then(() => {
    console.log('Microtask: Nested Promise.then');
  });
});

process.nextTick(() => {
  console.log('Microtask: process.nextTick');
  
  process.nextTick(() => {
    console.log('Microtask: Nested nextTick');
  });
});

console.log('End');

// ============================================
// PART 3: Complete Queue Exhaustion
// ============================================
console.log('\n--- PART 3: Microtask Queue Completely Exhausted ---\n');

console.log('A: Sync start');

setTimeout(() => {
  console.log('F: setTimeout (macrotask)');
}, 0);

// Multiple microtasks - ALL will execute before ANY macrotask
process.nextTick(() => {
  console.log('B: nextTick 1');
  
  process.nextTick(() => {
    console.log('C: nextTick 2 (nested)');
    
    process.nextTick(() => {
      console.log('D: nextTick 3 (deeply nested)');
    });
  });
});

Promise.resolve().then(() => {
  console.log('E: Promise.then (after all nextTicks)');
  
  Promise.resolve().then(() => {
    console.log('E2: Nested Promise.then');
  });
});

queueMicrotask(() => {
  console.log('E3: queueMicrotask');
});

console.log('A2: Sync end');

// ============================================
// PART 4: Real-World Scenario
// ============================================
console.log('\n--- PART 4: Real-World Scenario ---\n');

function fetchData() {
  console.log('📡 Fetching data...');
  
  // Simulate async operation (macrotask)
  setTimeout(() => {
    console.log('✅ Data received (macrotask)');
    
    // Process data (microtask)
    Promise.resolve().then(() => {
      console.log('🔄 Processing data (microtask)');
      
      // Update UI (microtask)
      queueMicrotask(() => {
        console.log('🎨 UI updated (microtask)');
      });
    });
    
    // Another macrotask
    setTimeout(() => {
      console.log('📊 Analytics sent (macrotask)');
    }, 0);
  }, 0);
  
  // Immediate microtask
  process.nextTick(() => {
    console.log('⚡ Loading indicator shown (microtask)');
  });
}

fetchData();
console.log('🚀 Function called');

// ============================================
// PART 5: Comparison Table Demonstration
// ============================================
console.log('\n--- PART 5: Side-by-Side Comparison ---\n');

console.log('=== MICROTASKS ===');
process.nextTick(() => console.log('  ✓ process.nextTick'));
Promise.resolve().then(() => console.log('  ✓ Promise.then'));
queueMicrotask(() => console.log('  ✓ queueMicrotask'));

console.log('\n=== MACROTASKS ===');
setTimeout(() => console.log('  ✓ setTimeout'), 0);
setInterval(() => {
  console.log('  ✓ setInterval (will run once)');
  clearInterval(intervalId);
}, 0);
const intervalId = setInterval(() => {}, 0);

setImmediate(() => console.log('  ✓ setImmediate'));

// I/O operations are also macrotasks
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('  ✓ fs.readFile (I/O macrotask)');
});

console.log('\n=== EXECUTION ORDER ===');
console.log('1. All synchronous code');
console.log('2. ALL microtasks (completely exhausted)');
console.log('3. THEN macrotasks (one at a time per phase)');

// ============================================
// PART 6: Key Differences Summary
// ============================================
console.log('\n--- PART 6: Key Differences ---\n');

setTimeout(() => {
  console.log('\n📋 SUMMARY:');
  console.log('\n🔹 MICROTASKS:');
  console.log('   • Higher priority');
  console.log('   • Queue completely exhausted before next phase');
  console.log('   • Examples: process.nextTick, Promise.then, queueMicrotask');
  console.log('   • Execute between event loop phases');
  
  console.log('\n🔹 MACROTASKS:');
  console.log('   • Lower priority');
  console.log('   • Execute one per phase (or limited per phase)');
  console.log('   • Examples: setTimeout, setImmediate, I/O callbacks');
  console.log('   • Part of event loop phases (Timers, Poll, Check, etc.)');
  
  console.log('\n🔹 EXECUTION RULE:');
  console.log('   Microtasks ALWAYS execute before Macrotasks!');
}, 100);

/*
EXECUTION ORDER SUMMARY:

1. Synchronous code (top to bottom)
2. ALL Microtasks (completely exhausted):
   a. process.nextTick queue (all callbacks)
   b. Promise.then queue (all callbacks)
   c. queueMicrotask queue (all callbacks)
3. Event Loop Phase (Macrotasks):
   - Timers phase (setTimeout, setInterval)
   - Pending callbacks
   - Poll phase (I/O)
   - Check phase (setImmediate)
   - Close callbacks
4. Between each phase, microtasks run again!

KEY INSIGHT:
Microtasks have HIGHER priority and execute COMPLETELY
before any macrotask can run. This is why Promise.then()
callbacks execute before setTimeout() even with 0ms delay.
*/

