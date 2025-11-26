# ⚡ Event Loop Performance Demo

यह project Node.js Event Loop, Blocking vs Non-Blocking code, aur Microtasks vs Macrotasks ko practically demonstrate करता है।

## 📚 Table of Contents

1. [Overview](#overview)
2. [Event Loop Phases](#event-loop-phases)
3. [Blocking vs Non-Blocking](#blocking-vs-non-blocking)
4. [Microtasks vs Macrotasks](#microtasks-vs-macrotasks)
5. [Examples](#examples)
6. [Installation](#installation)
7. [How to Run](#how-to-run)

---

## 🎯 Overview

Ye project dikhata hai ki:
- **Blocking code** throughput ko kaise affect karta hai
- **1000 concurrent requests** kaise handle hote hain
- **Event loop phases** kaise kaam karte hain
- **Microtasks aur Macrotasks** ka execution order
- **Performance comparison** different scenarios mein

---

## 🔄 Event Loop Phases

Node.js Event Loop **6 main phases** mein kaam karta hai:

1. **Timers Phase** - setTimeout(), setInterval()
2. **Pending Callbacks** - Deferred callbacks
3. **Idle/Prepare** - Internal operations
4. **Poll Phase** - I/O operations
5. **Check Phase** - setImmediate()
6. **Close Callbacks** - Stream close events

**Microtask Queues** har phase ke **between** execute hote hain:
- `process.nextTick()` - Highest priority
- `Promise.then()` - Promise callbacks

📖 **Detailed Explanation**: [EVENT_LOOP_PHASES.md](./EVENT_LOOP_PHASES.md)

---

## 🚦 Blocking vs Non-Blocking

### ❌ **Blocking Code**:
```javascript
// Event loop ko block karta hai
function blockingTask() {
  let sum = 0;
  for (let i = 0; i < 10000000; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}

// Ye code execute hote time baaki sab requests wait karte hain
server.on('request', (req, res) => {
  blockingTask(); // Blocks event loop!
  res.end('Done');
});
```

**Problems**:
- Event loop block ho jata hai
- Concurrent requests handle nahi ho sakte
- Throughput bahut kam hota hai
- Poor performance

### ✅ **Non-Blocking Code**:
```javascript
// Event loop free rehta hai
function nonBlockingTask() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Done'), 10);
  });
}

// Ye code execute hote time bhi baaki requests handle ho sakte hain
server.on('request', async (req, res) => {
  await nonBlockingTask(); // Doesn't block!
  res.end('Done');
});
```

**Benefits**:
- Event loop free rehta hai
- Multiple requests simultaneously handle hote hain
- High throughput
- Better performance

---

## ⚡ Microtasks vs Macrotasks

### **Macrotasks** (Task Queue):
- `setTimeout()`
- `setInterval()`
- `setImmediate()`
- I/O operations
- Event listeners

### **Microtasks** (Microtask Queue):
- `Promise.then()`
- `Promise.catch()`
- `Promise.finally()`
- `queueMicrotask()`
- `process.nextTick()` (highest priority!)

### **Execution Order**:
```
1. Synchronous Code
2. process.nextTick() ← Highest Priority
3. Promise.then() ← Microtask
4. setTimeout() ← Macrotask
5. setImmediate() ← Macrotask
```

**Key Point**: Microtasks **immediately** execute hote hain aur **macrotasks ko block** kar sakte hain!

---

## 📁 Examples

### 1. Blocking vs Non-Blocking (`01-blocking-vs-nonblocking.js`)
```bash
npm run blocking
```
- Blocking aur non-blocking servers ka comparison
- Throughput difference dikhata hai
- 100 concurrent requests ka test
- Real performance metrics

### 2. 1000 Concurrent Requests (`02-1000-concurrent-requests.js`)
```bash
npm run concurrent
```
- **Promise.all** use karke 1000 concurrent requests
- Blocking code ka impact dikhata hai
- Request timing aur throughput analysis
- Real-world scenario simulation

### 3. Event Loop Phases (`03-event-loop-phases.js`)
```bash
npm run event-loop
```
- Event loop phases ka visual explanation
- Phase execution order demonstration
- Synchronous vs asynchronous execution
- Complete event loop cycle

### 4. Microtask vs Macrotask (`04-microtask-vs-macrotask.js`)
```bash
npm run microtask
```
- Microtasks aur macrotasks ka execution order
- Priority demonstration
- Nested promises example
- Real-world scenarios

### 5. Throughput Comparison (`05-throughput-comparison.js`)
```bash
npm run throughput
```
- Complete throughput analysis
- Blocking, non-blocking, aur hybrid servers
- 1000 requests ka comprehensive test
- Detailed performance metrics

---

## 🚀 Installation

```bash
cd event-loop-performance-demo
npm install
```

**Note**: No external dependencies required - uses only Node.js built-in modules!

---

## 🚀 How to Run

### Run Individual Examples:
```bash
npm run blocking          # Blocking vs Non-Blocking comparison
npm run concurrent        # 1000 concurrent requests simulation
npm run event-loop        # Event loop phases demonstration
npm run microtask         # Microtask vs Macrotask order
npm run throughput        # Complete throughput comparison
```

### Run All Examples:
```bash
npm run all
```

### Or Directly:
```bash
node 01-blocking-vs-nonblocking.js
node 02-1000-concurrent-requests.js
node 03-event-loop-phases.js
node 04-microtask-vs-macrotask.js
node 05-throughput-comparison.js
```

---

## 🔑 Key Concepts

### 1. **Blocking Code Impact**

```javascript
// ❌ BAD: Blocking
function heavyTask() {
  // CPU-intensive work
  for (let i = 0; i < 10000000; i++) {
    // Blocks event loop
  }
}

// ✅ GOOD: Non-Blocking
async function lightTask() {
  // Async operation
  await someAsyncOperation();
}
```

### 2. **Promise.all for Concurrent Requests**

```javascript
// 1000 concurrent requests
const requests = [];

for (let i = 0; i < 1000; i++) {
  requests.push(
    fetch('http://api.example.com/data')
      .then(res => res.json())
  );
}

// Wait for all to complete
const results = await Promise.all(requests);
```

### 3. **Event Loop Phase Execution**

```javascript
console.log('1. Sync');

setTimeout(() => console.log('4. Timer'), 0);
setImmediate(() => console.log('5. Immediate'));

Promise.resolve().then(() => console.log('3. Promise'));
process.nextTick(() => console.log('2. NextTick'));

// Output:
// 1. Sync
// 2. NextTick
// 3. Promise
// 4. Timer
// 5. Immediate
```

---

## 💡 Important Takeaways

### ✅ **Best Practices**:

1. **Always Prefer Non-Blocking Code**:
   - Use async/await for I/O operations
   - Avoid heavy synchronous computations
   - Break long tasks into smaller chunks

2. **Use Promise.all for Concurrency**:
   - Multiple async operations parallel mein run karo
   - Better throughput aur performance

3. **Understand Event Loop**:
   - Know execution order
   - Avoid blocking the event loop
   - Use appropriate async patterns

4. **Microtasks vs Macrotasks**:
   - Use `process.nextTick()` for immediate cleanup
   - Use `Promise.then()` for promise chains
   - Use `setTimeout()` for deferring work

### ❌ **Common Mistakes**:

1. **Blocking Event Loop**:
   ```javascript
   // ❌ DON'T: Heavy sync operations
   for (let i = 0; i < 100000000; i++) {
     // Blocks everything!
   }
   ```

2. **Too Many Microtasks**:
   ```javascript
   // ❌ DON'T: Recursive microtasks
   function recursive() {
     Promise.resolve().then(() => {
       recursive(); // Can starve event loop!
     });
   }
   ```

3. **Ignoring Errors**:
   ```javascript
   // ❌ DON'T: Unhandled promise rejections
   Promise.all([...]).then(...); // No .catch()!
   ```

---

## 📊 Performance Impact

### Blocking Code:
- **Throughput**: ~10-50 req/sec (depends on CPU work)
- **Response Time**: High (sequential processing)
- **Event Loop**: Blocked during execution
- **Scalability**: Poor

### Non-Blocking Code:
- **Throughput**: ~1000+ req/sec (depends on I/O)
- **Response Time**: Low (parallel processing)
- **Event Loop**: Free (can handle other requests)
- **Scalability**: Excellent

**Improvement**: Non-blocking code can be **10-100x faster** in concurrent scenarios!

---

## 🛠️ Technologies Used

- **Node.js** (Built-in modules only)
  - `http` - HTTP servers
  - `process` - Process management
  - Native Promise API
  - Event Loop (built-in)

---

## 📖 Further Reading

- [Event Loop Phases Document](./EVENT_LOOP_PHASES.md)
- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Blocking vs Non-Blocking](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/)

---

## 🌟 Real-World Applications

1. **API Servers**: High-traffic REST APIs
2. **Data Processing**: Large dataset operations
3. **Real-time Applications**: WebSockets, streaming
4. **Microservices**: Concurrent service calls

---

## 🎯 Milestones

✅ **Short Note**: [EVENT_LOOP_PHASES.md](./EVENT_LOOP_PHASES.md) - Complete event loop phases explanation

✅ **Demo Script**: `04-microtask-vs-macrotask.js` - Microtask vs Macrotask execution order

✅ **1000 Concurrent Requests**: `02-1000-concurrent-requests.js` - Promise.all simulation

✅ **Throughput Comparison**: `05-throughput-comparison.js` - Blocking vs Non-blocking impact

---

**Happy Learning! 🎓**

