// ============================================
// Example 3: process.nextTick vs Promise
// ============================================
// Both are microtasks, but process.nextTick has HIGHER priority
// process.nextTick queue is processed BEFORE Promise queue

console.log('=== process.nextTick vs Promise ===\n');

console.log('Start');

// Promise callbacks
Promise.resolve().then(() => {
  console.log('Promise 1');
  
  process.nextTick(() => {
    console.log('nextTick inside Promise 1');
  });
  
  Promise.resolve().then(() => {
    console.log('Promise 2 (nested)');
  });
});

process.nextTick(() => {
  console.log('nextTick 1');
  
  process.nextTick(() => {
    console.log('nextTick 2 (nested)');
  });
  
  Promise.resolve().then(() => {
    console.log('Promise inside nextTick 1');
  });
});

// queueMicrotask is same priority as Promise
queueMicrotask(() => {
  console.log('queueMicrotask 1');
});

Promise.resolve().then(() => {
  console.log('Promise 3');
});

process.nextTick(() => {
  console.log('nextTick 3');
});

console.log('End');

/*
Expected order:
1. Start
2. End
3. nextTick 1 (all nextTick callbacks first)
4. nextTick 2 (nested)
5. nextTick 3
6. Promise inside nextTick 1
7. Promise 1 (then Promise callbacks)
8. Promise 2 (nested)
9. Promise 3
10. queueMicrotask 1 (same as Promise)

Key insight: process.nextTick queue is completely exhausted 
before Promise queue is processed!
*/

