// ============================================
// Example 4: Microtask vs Macrotask Order
// ============================================
// Ye example clearly dikhata hai ki microtasks aur macrotasks kaise execute hote hain
// Aur unke execution order ko demonstrate karta hai

console.log('='.repeat(60));
console.log('⚡ Microtask vs Macrotask - Execution Order Demo');
console.log('='.repeat(60));

console.log('\n📚 TYPES OF TASKS:\n');

console.log('🔵 MACROTASKS (Task Queue):');
console.log('   - setTimeout()');
console.log('   - setInterval()');
console.log('   - setImmediate()');
console.log('   - I/O operations');
console.log('   - Event listeners');

console.log('\n🟢 MICROTASKS (Microtask Queue):');
console.log('   - Promise.then()');
console.log('   - Promise.catch()');
console.log('   - Promise.finally()');
console.log('   - queueMicrotask()');
console.log('   - process.nextTick() (Even higher priority!)');

console.log('\n🚀 EXECUTION ORDER DEMONSTRATION:\n');
console.log('─'.repeat(60));

// ============================================
// SCENARIO 1: Basic Order
// ============================================

console.log('\n📋 SCENARIO 1: Basic Execution Order\n');

console.log('📝 [SYNC] Step 1: Synchronous code starts');

// Macrotask
setTimeout(() => {
  console.log('⏰ [MACROTASK] setTimeout callback');
}, 0);

// Macrotask
setImmediate(() => {
  console.log('✅ [MACROTASK] setImmediate callback');
});

// Microtask
Promise.resolve().then(() => {
  console.log('⚡ [MICROTASK] Promise.then callback');
});

// NextTick (highest priority microtask)
process.nextTick(() => {
  console.log('🎯 [NEXT TICK] process.nextTick callback');
});

console.log('📝 [SYNC] Step 2: Synchronous code continues');

// Another microtask
queueMicrotask(() => {
  console.log('⚡ [MICROTASK] queueMicrotask callback');
});

console.log('📝 [SYNC] Step 3: Synchronous code ends');

// ============================================
// SCENARIO 2: Nested Promises
// ============================================

setTimeout(() => {
  console.log('\n📋 SCENARIO 2: Nested Microtasks\n');
  
  console.log('⏰ [MACROTASK] setTimeout callback starts');
  
  Promise.resolve()
    .then(() => {
      console.log('⚡ [MICROTASK] Promise 1 - then');
      return Promise.resolve();
    })
    .then(() => {
      console.log('⚡ [MICROTASK] Promise 2 - then');
    });
  
  queueMicrotask(() => {
    console.log('⚡ [MICROTASK] queueMicrotask in setTimeout');
  });
  
  console.log('⏰ [MACROTASK] setTimeout callback ends');
}, 50);

// ============================================
// SCENARIO 3: Microtasks Blocking Macrotasks
// ============================================

setTimeout(() => {
  console.log('\n📋 SCENARIO 3: Microtasks Blocking Macrotasks\n');
  
  // This macrotask should run
  setTimeout(() => {
    console.log('⏰ [MACROTASK] setTimeout 1 (should run first)');
  }, 0);
  
  // But microtasks will block it
  Promise.resolve().then(() => {
    console.log('⚡ [MICROTASK] Promise 1 - blocks macrotasks');
    
    return Promise.resolve();
  }).then(() => {
    console.log('⚡ [MICROTASK] Promise 2 - still blocking');
    
    return Promise.resolve();
  }).then(() => {
    console.log('⚡ [MICROTASK] Promise 3 - continues blocking');
    
    // Even more microtasks
    queueMicrotask(() => {
      console.log('⚡ [MICROTASK] queueMicrotask - still blocking');
      
      queueMicrotask(() => {
        console.log('⚡ [MICROTASK] Nested queueMicrotask - still blocking');
      });
    });
  });
  
  // This macrotask waits until ALL microtasks complete
  setTimeout(() => {
    console.log('⏰ [MACROTASK] setTimeout 2 (runs AFTER all microtasks)');
  }, 0);
  
}, 100);

// ============================================
// SCENARIO 4: process.nextTick Priority
// ============================================

setTimeout(() => {
  console.log('\n📋 SCENARIO 4: process.nextTick Priority\n');
  
  Promise.resolve().then(() => {
    console.log('⚡ [MICROTASK] Promise.then');
  });
  
  process.nextTick(() => {
    console.log('🎯 [NEXT TICK] process.nextTick (highest priority)');
  });
  
  queueMicrotask(() => {
    console.log('⚡ [MICROTASK] queueMicrotask');
  });
  
}, 150);

// ============================================
// SCENARIO 5: Real-world Example
// ============================================

setTimeout(() => {
  console.log('\n📋 SCENARIO 5: Real-world HTTP Request Example\n');
  
  console.log('🌐 [SIMULATED] HTTP Request starts');
  
  // Simulate async HTTP request
  Promise.resolve() // Simulating fetch()
    .then(() => {
      console.log('⚡ [MICROTASK] HTTP response received');
      return { data: 'user data' };
    })
    .then((response) => {
      console.log('⚡ [MICROTASK] Processing response data');
      
      // Process data synchronously
      process.nextTick(() => {
        console.log('🎯 [NEXT TICK] Update UI immediately');
      });
      
      return response.data;
    })
    .then((data) => {
      console.log('⚡ [MICROTASK] Data transformation complete');
    });
  
  // Other work that can happen
  setTimeout(() => {
    console.log('⏰ [MACROTASK] Other scheduled task');
  }, 0);
  
  console.log('🌐 [SIMULATED] HTTP Request initiated (non-blocking)');
  
}, 200);

// Summary after all demos
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 EXECUTION ORDER SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n🎯 PRIORITY ORDER (Highest to Lowest):\n');
  console.log('   1. process.nextTick()  ← Highest priority');
  console.log('   2. Promise.then()      ← Microtask queue');
  console.log('   3. queueMicrotask()    ← Microtask queue');
  console.log('   4. setTimeout()        ← Macrotask (Timers phase)');
  console.log('   5. setImmediate()      ← Macrotask (Check phase)');
  console.log('   6. I/O operations      ← Macrotask (Poll phase)');
  
  console.log('\n💡 KEY INSIGHTS:\n');
  console.log('   ✅ Microtasks execute IMMEDIATELY after current code');
  console.log('   ✅ process.nextTick() has EVEN HIGHER priority');
  console.log('   ✅ Microtasks can BLOCK macrotasks');
  console.log('   ✅ All microtasks complete before next macrotask');
  console.log('   ✅ Event loop processes ALL microtasks before moving to next phase');
  
  console.log('\n⚠️  WARNING:\n');
  console.log('   ❌ Too many microtasks can starve the event loop');
  console.log('   ❌ Blocking macrotasks (setTimeout, I/O) from executing');
  console.log('   ❌ Always be careful with recursive microtasks!');
  
  console.log('\n✅ Best Practice:\n');
  console.log('   ✅ Use process.nextTick() for immediate cleanup');
  console.log('   ✅ Use Promise.then() for promise chains');
  console.log('   ✅ Use setTimeout() for deferring work');
  console.log('   ✅ Keep microtask queues short!\n');
  
  process.exit(0);
}, 300);

