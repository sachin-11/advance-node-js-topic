// ============================================
// Example 2: Event Loop Phases (Deep Dive)
// ============================================
// Node.js Event Loop has 6 main phases:
// 1. Timers: Execute setTimeout/setInterval callbacks
// 2. Pending callbacks: Execute I/O callbacks deferred to next loop
// 3. Idle, prepare: Internal use only
// 4. Poll: Fetch new I/O events, execute I/O callbacks
// 5. Check: Execute setImmediate() callbacks
// 6. Close callbacks: Execute close callbacks (e.g., socket.on('close'))

console.log('=== Event Loop Phases ===\n');

console.log('[START] Synchronous code begins');

// Phase 1: Timers
setTimeout(() => {
  console.log('[PHASE 1: Timers] setTimeout callback');
}, 0);

// Phase 5: Check (setImmediate)
setImmediate(() => {
  console.log('[PHASE 5: Check] setImmediate callback');
});

// Between each phase, microtasks run:
process.nextTick(() => {
  console.log('[MICROTASK] process.nextTick - runs between phases');
});

Promise.resolve().then(() => {
  console.log('[MICROTASK] Promise - runs between phases');
});

// Poll phase demonstration (I/O)
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('[PHASE 4: Poll] I/O callback (readFile)');
  
  // Inside I/O callback, order matters:
  setTimeout(() => {
    console.log('[Inside I/O] setTimeout');
  }, 0);
  
  setImmediate(() => {
    console.log('[Inside I/O] setImmediate (executes first here!)');
  });
  
  process.nextTick(() => {
    console.log('[Inside I/O] nextTick (highest priority)');
  });
});

console.log('[END] Synchronous code ends');

