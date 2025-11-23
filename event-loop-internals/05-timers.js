// ============================================
// Example 5: Timers (setTimeout, setInterval)
// ============================================
// Timers execute in the "Timers" phase of the event loop

console.log('=== Timers Deep Dive ===\n');

console.log('Start - timestamp:', Date.now());

// Timer with 0ms delay (minimum 1ms in Node.js)
setTimeout(() => {
  console.log('setTimeout(0) - timestamp:', Date.now());
}, 0);

// Timer with actual delay
setTimeout(() => {
  console.log('setTimeout(100) - timestamp:', Date.now());
}, 100);

// Nested timers
setTimeout(() => {
  console.log('Outer setTimeout');
  
  setTimeout(() => {
    console.log('Inner setTimeout');
  }, 0);
  
  process.nextTick(() => {
    console.log('nextTick inside timer');
  });
}, 0);

// setInterval demonstration
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log(`setInterval tick ${count}`);
  
  if (count >= 3) {
    clearInterval(intervalId);
    console.log('Interval cleared');
    
    // After clearing, show what runs next
    process.nextTick(() => {
      console.log('nextTick after interval cleared');
    });
  }
}, 50);

// Microtasks execute before timer callbacks
process.nextTick(() => {
  console.log('nextTick - before timers');
});

Promise.resolve().then(() => {
  console.log('Promise - before timers');
});

console.log('End - timestamp:', Date.now());

/*
Key points:
- setTimeout(0) doesn't mean "execute immediately"
- Minimum delay is ~1ms in Node.js
- Microtasks (nextTick, Promise) run before timer callbacks
- Timers are not guaranteed to execute at exact time (event loop can be busy)
*/

