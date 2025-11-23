// ============================================
// Example 8: Advanced Scenarios
// ============================================
// Complex event loop scenarios

console.log('=== Advanced Event Loop Scenarios ===\n');

// Scenario 1: Starving the event loop
console.log('--- Scenario 1: Microtask Queue Starvation ---');

function starveEventLoop() {
  process.nextTick(() => {
    console.log('nextTick 1');
    
    // Recursive nextTick can starve event loop!
    // Uncomment to see starvation:
    // starveEventLoop();
  });
}

// starveEventLoop(); // WARNING: This blocks forever!

// Scenario 2: Promise chain
console.log('\n--- Scenario 2: Promise Chain ---');
Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Promise 2');
    process.nextTick(() => {
      console.log('nextTick in Promise 2');
    });
  })
  .then(() => {
    console.log('Promise 3');
  });

process.nextTick(() => {
  console.log('nextTick before Promise chain');
});

// Scenario 3: async/await (sugar for Promises)
console.log('\n--- Scenario 3: async/await ---');
async function asyncFunction() {
  console.log('async function starts');
  
  await Promise.resolve();
  console.log('after first await');
  
  await Promise.resolve();
  console.log('after second await');
  
  process.nextTick(() => {
    console.log('nextTick in async function');
  });
}

asyncFunction();
console.log('after async function call');

// Scenario 4: Mixed operations
console.log('\n--- Scenario 4: Complex Mixed Operations ---');

console.log('A: Sync');

setTimeout(() => console.log('B: setTimeout(0)'), 0);
setTimeout(() => console.log('C: setTimeout(100)'), 100);

process.nextTick(() => {
  console.log('D: nextTick');
  process.nextTick(() => {
    console.log('E: nested nextTick');
  });
});

Promise.resolve().then(() => {
  console.log('F: Promise 1');
  Promise.resolve().then(() => {
    console.log('G: nested Promise');
  });
});

queueMicrotask(() => {
  console.log('H: queueMicrotask');
});

setImmediate(() => {
  console.log('I: setImmediate');
  
  setTimeout(() => {
    console.log('J: setTimeout in setImmediate');
  }, 0);
  
  setImmediate(() => {
    console.log('K: setImmediate in setImmediate');
  });
});

console.log('L: Sync end');

/*
Execution order (approximate):
A, L (sync)
D, E (nextTick queue - completely exhausted)
F, G (Promise queue - completely exhausted)
H (queueMicrotask)
I (setImmediate)
K (nested setImmediate)
B (setTimeout - Timers phase)
J (setTimeout in setImmediate)
C (setTimeout(100))
*/

