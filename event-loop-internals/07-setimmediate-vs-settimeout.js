// ============================================
// Example 7: setImmediate vs setTimeout
// ============================================
// Tricky behavior difference based on context!

console.log('=== setImmediate vs setTimeout ===\n');

// Scenario 1: In the main module (top-level)
console.log('--- Scenario 1: Top-level execution ---');
setTimeout(() => {
  console.log('setTimeout(0) - top level');
}, 0);

setImmediate(() => {
  console.log('setImmediate - top level');
});

// Order is NON-DETERMINISTIC at top level!
// It depends on event loop timing

// Scenario 2: Inside an I/O callback (deterministic!)
console.log('\n--- Scenario 2: Inside I/O callback ---');
const fs = require('fs');

fs.readFile(__filename, () => {
  console.log('Inside I/O callback:');
  
  setTimeout(() => {
    console.log('setTimeout(0) - inside I/O');
  }, 0);
  
  setImmediate(() => {
    console.log('setImmediate - inside I/O (executes FIRST here!)');
  });
  
  process.nextTick(() => {
    console.log('nextTick - inside I/O (always first)');
  });
});

// Scenario 3: Nested timers
console.log('\n--- Scenario 3: Nested in setTimeout ---');
setTimeout(() => {
  console.log('Outer setTimeout');
  
  setTimeout(() => {
    console.log('Inner setTimeout');
  }, 0);
  
  setImmediate(() => {
    console.log('setImmediate in setTimeout (executes FIRST!)');
  });
}, 0);

// Scenario 4: Inside setImmediate
console.log('\n--- Scenario 4: Inside setImmediate ---');
setImmediate(() => {
  console.log('Outer setImmediate');
  
  setTimeout(() => {
    console.log('setTimeout in setImmediate');
  }, 0);
  
  setImmediate(() => {
    console.log('Inner setImmediate');
  });
});

process.nextTick(() => {
  console.log('nextTick - runs before everything');
});

console.log('\n--- Synchronous code ends ---');

/*
Key insights:
1. Top-level: Order is non-deterministic (depends on event loop state)
2. Inside I/O callback: setImmediate runs before setTimeout(0)
3. Inside setTimeout: setImmediate runs first
4. Inside setImmediate: Order depends on next tick
5. process.nextTick always has highest priority
*/

