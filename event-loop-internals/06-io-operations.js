// ============================================
// Example 6: I/O Operations
// ============================================
// I/O callbacks execute in the "Poll" phase

const fs = require('fs');
const path = require('path');

console.log('=== I/O Operations Deep Dive ===\n');

console.log('Start');

// File I/O operation
fs.readFile(__filename, 'utf8', () => {
  console.log('[I/O Callback] File read completed');
  
  // Inside I/O callback context:
  setTimeout(() => {
    console.log('[Inside I/O] setTimeout');
  }, 0);
  
  setImmediate(() => {
    console.log('[Inside I/O] setImmediate (executes before setTimeout here!)');
  });
  
  process.nextTick(() => {
    console.log('[Inside I/O] nextTick (highest priority)');
  });
  
  Promise.resolve().then(() => {
    console.log('[Inside I/O] Promise');
  });
});

// Multiple I/O operations
fs.readFile(__filename, 'utf8', () => {
  console.log('[I/O Callback] Second file read');
});

// Network I/O (using built-in http if available)
// Simulating with timer for demonstration
setTimeout(() => {
  console.log('[Simulated I/O] Network request callback');
}, 0);

process.nextTick(() => {
  console.log('nextTick - before I/O completes');
});

Promise.resolve().then(() => {
  console.log('Promise - before I/O completes');
});

setImmediate(() => {
  console.log('setImmediate - before I/O (in Check phase)');
});

console.log('End');

/*
Key points:
- I/O operations are asynchronous
- I/O callbacks execute in Poll phase
- Inside I/O callback, setImmediate often runs before setTimeout(0)
- Microtasks always run first, even in I/O callbacks
*/

