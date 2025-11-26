// ============================================
// Example 3: Event Loop Phases Demonstration
// ============================================
// Ye example dikhata hai ki event loop kaise different phases mein kaam karta hai

console.log('='.repeat(60));
console.log('🔄 Event Loop Phases - Detailed Explanation');
console.log('='.repeat(60));

// ============================================
// EVENT LOOP PHASES
// ============================================

console.log('\n📚 Event Loop has 6 MAIN PHASES:\n');

console.log('┌─────────────────────────────────────────────────────┐');
console.log('│            NODE.JS EVENT LOOP                       │');
console.log('└─────────────────────────────────────────────────────┘');
console.log('');
console.log('    ┌─────────────────────────────────────┐');
console.log('    │  1. TIMERS PHASE                    │');
console.log('    │     - setTimeout()                  │');
console.log('    │     - setInterval()                 │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  2. PENDING CALLBACKS               │');
console.log('    │     - I/O callbacks (errors, etc)   │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  3. IDLE/PREPARE (Internal)         │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  4. POLL PHASE                      │');
console.log('    │     - Fetch new I/O events          │');
console.log('    │     - Execute I/O callbacks         │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  5. CHECK PHASE                     │');
console.log('    │     - setImmediate() callbacks      │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  6. CLOSE CALLBACKS                 │');
console.log('    │     - socket.on("close")            │');
console.log('    │     - stream.on("close")            │');
console.log('    └──────────────┬──────────────────────┘');
console.log('                   │');
console.log('    ┌──────────────▼──────────────────────┐');
console.log('    │  MICROTASK QUEUES (Between phases)  │');
console.log('    │     - process.nextTick()            │');
console.log('    │     - Promise.then()                │');
console.log('    └─────────────────────────────────────┘');
console.log('');

// ============================================
// DEMONSTRATION
// ============================================

console.log('\n🚀 Demonstrating Event Loop Phase Execution Order:\n');
console.log('─'.repeat(60));

// Phase 1: Timers
setTimeout(() => {
  console.log('⏰ [TIMERS PHASE] setTimeout callback executed');
}, 0);

setInterval(() => {
  // This won't run in our demo
}, 10000);

// Phase 2: Pending Callbacks (usually empty in normal operation)
// (We skip this as it's mostly internal)

// Phase 4: Poll Phase - I/O operations
// We'll simulate with setImmediate

// Phase 5: Check Phase - setImmediate
setImmediate(() => {
  console.log('✅ [CHECK PHASE] setImmediate callback executed');
});

// Microtasks (executed between phases)
Promise.resolve().then(() => {
  console.log('⚡ [MICROTASK] Promise.then() callback executed');
});

process.nextTick(() => {
  console.log('🎯 [NEXT TICK] process.nextTick() callback executed (highest priority)');
});

// Another microtask
Promise.resolve().then(() => {
  console.log('⚡ [MICROTASK] Another Promise.then() callback executed');
});

// Synchronous code (executes first)
console.log('📝 [SYNCHRONOUS] This executes first (main execution)');

// More timers
setTimeout(() => {
  console.log('⏰ [TIMERS PHASE] Another setTimeout callback');
}, 0);

// More setImmediate
setImmediate(() => {
  console.log('✅ [CHECK PHASE] Another setImmediate callback');
});

console.log('\n💡 Expected Execution Order:');
console.log('   1. Synchronous code');
console.log('   2. process.nextTick() - Highest priority');
console.log('   3. Promise.then() - Microtask queue');
console.log('   4. Timers phase (setTimeout)');
console.log('   5. Check phase (setImmediate)');
console.log('\n⏳ Running demonstration...\n');

// Let event loop run
setTimeout(() => {
  console.log('\n' + '─'.repeat(60));
  console.log('✅ Demonstration Complete!\n');
  
  console.log('📖 Key Points:');
  console.log('   1. process.nextTick() has HIGHEST priority');
  console.log('   2. Promise.then() executes after nextTick');
  console.log('   3. Timers (setTimeout) execute in Timers phase');
  console.log('   4. setImmediate() executes in Check phase');
  console.log('   5. Event loop processes each phase completely');
  console.log('   6. Microtasks run BETWEEN phases\n');
  
  process.exit(0);
}, 100);

