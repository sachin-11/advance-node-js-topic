// ============================================
// Example 4: Microtask Queue (Deep Dive)
// ============================================
// Microtasks include:
// - process.nextTick() (highest priority)
// - Promise.then() / Promise.catch()
// - queueMicrotask()

console.log('=== Microtask Queue Deep Dive ===\n');

function demonstrateMicrotasks() {
  console.log('--- Function starts ---');
  
  // Microtask 1
  process.nextTick(() => {
    console.log('nextTick 1');
  });
  
  // Microtask 2
  Promise.resolve('value').then(() => {
    console.log('Promise.then 1');
    
    // Nested microtasks
    process.nextTick(() => {
      console.log('nextTick inside Promise');
    });
    
    queueMicrotask(() => {
      console.log('queueMicrotask inside Promise');
    });
  });
  
  // Microtask 3
  queueMicrotask(() => {
    console.log('queueMicrotask 1');
  });
  
  // Microtask 4
  process.nextTick(() => {
    console.log('nextTick 2');
  });
  
  console.log('--- Function ends ---');
}

console.log('Calling function...');
demonstrateMicrotasks();
console.log('After function call');

// Microtasks execute BEFORE any macrotasks
setTimeout(() => {
  console.log('setTimeout (macrotask) - runs after all microtasks');
}, 0);

/*
Execution order:
1. "Calling function..."
2. "--- Function starts ---"
3. "--- Function ends ---"
4. "After function call"
5. All nextTick callbacks (1, 2, nested one)
6. All Promise.then callbacks
7. All queueMicrotask callbacks
8. setTimeout (macrotask)
*/

