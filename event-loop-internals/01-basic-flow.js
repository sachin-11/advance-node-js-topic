// ============================================
// Example 1: Basic Event Loop Flow
// ============================================
// Understanding the order of execution:
// 1. Synchronous code executes first
// 2. process.nextTick() callbacks (highest priority)
// 3. Promise.then() / queueMicrotask() callbacks
// 4. Then async operations (timers, I/O, etc.)

console.log('=== Basic Event Loop Flow ===\n');

console.log('1. [SYNC] Start');

process.nextTick(() => {
  console.log('4. [nextTick] This has highest priority in microtask queue');
});

Promise.resolve().then(() => {
  console.log('5. [Promise] Promise callback (microtask)');
});

queueMicrotask(() => {
  console.log('6. [queueMicrotask] Also a microtask');
});

setTimeout(() => {
  console.log('8. [setTimeout] Macrotask (Timer phase)');
}, 0);

setImmediate(() => {
  console.log('9. [setImmediate] Macrotask (Check phase)');
});

console.log('2. [SYNC] Middle');

// Simulating some work
for (let i = 0; i < 1000; i++) {
  // Small delay
}

console.log('3. [SYNC] End');

// After all synchronous code, microtasks execute, then macrotasks

