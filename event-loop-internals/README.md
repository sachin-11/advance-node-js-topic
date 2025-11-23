# 🔄 Node.js Event Loop Internals - Deep Dive

यह project Node.js Event Loop के बारे में गहरी समझ देता है।

## 📚 Table of Contents

1. [Event Loop क्या है?](#event-loop-क्या-है)
2. [Event Loop Phases](#event-loop-phases)
3. [Execution Order](#execution-order)
4. [Examples](#examples)
5. [Key Concepts](#key-concepts)

---

## 🎯 Event Loop क्या है?

Node.js Event Loop एक **single-threaded** mechanism है जो asynchronous operations को handle करता है। यह कभी block नहीं होता और continuously चलता रहता है।

### Basic Flow:
```
1. Synchronous Code (executes immediately)
2. Microtasks (process.nextTick, Promise)
3. Macrotasks (Timers, I/O, setImmediate)
```

---

## 🔄 Event Loop Phases

Node.js Event Loop में **6 main phases** होते हैं:

### 1. **Timers Phase** ⏱️
- `setTimeout()` और `setInterval()` callbacks execute होते हैं
- Minimum delay ~1ms होता है (0ms नहीं)

### 2. **Pending Callbacks Phase** 📋
- Deferred I/O callbacks execute होते हैं
- Previous loop से defer हुए callbacks

### 3. **Idle, Prepare Phase** 🔧
- Internal use के लिए
- Normally हमें direct access नहीं

### 4. **Poll Phase** 📡
- **Most Important Phase!**
- New I/O events fetch करता है
- I/O callbacks execute करता है (file system, network)
- यहाँ event loop block हो सकता है अगर queue empty है

### 5. **Check Phase** ✅
- `setImmediate()` callbacks execute होते हैं
- Poll phase complete होने के बाद

### 6. **Close Callbacks Phase** 🔒
- Close events handle करता है (e.g., `socket.on('close')`)

---

## 📊 Execution Order

### Priority Order (Highest to Lowest):

1. **Synchronous Code** (top to bottom)
2. **process.nextTick()** queue (completely exhausted)
3. **Promise.then()** / **queueMicrotask()** queue (completely exhausted)
4. **Macrotasks** (Event Loop phases):
   - Timers
   - Pending Callbacks
   - Poll (I/O)
   - Check (setImmediate)
   - Close Callbacks

### Between Each Phase:
- Microtasks (nextTick, Promise) run बीच-बीच में

---

## 📁 Examples

### 1. Basic Flow (`01-basic-flow.js`)
```bash
npm run basic
```
- Basic execution order समझाता है
- Synchronous → Microtasks → Macrotasks

### 2. Event Loop Phases (`02-event-loop-phases.js`)
```bash
npm run phases
```
- सभी 6 phases demonstrate करता है
- Phase transitions समझाता है

### 3. nextTick vs Promise (`03-nexttick-vs-promise.js`)
```bash
npm run nexttick
```
- **Key Insight:** `process.nextTick` की priority **HIGHER** है Promise से
- nextTick queue पूरी तरह खाली होने के बाद Promise queue process होती है

### 4. Microtask Queue (`04-microtask-queue.js`)
```bash
npm run microtask
```
- Microtask queue का deep dive
- Nested microtasks का behavior

### 5. Timers (`05-timers.js`)
```bash
npm run timers
```
- `setTimeout()` और `setInterval()` behavior
- Minimum delay concepts
- Timer precision limitations

### 6. I/O Operations (`06-io-operations.js`)
```bash
npm run io
```
- File system operations
- Poll phase demonstration
- I/O callback context में order

### 7. setImmediate vs setTimeout (`07-setimmediate-vs-settimeout.js`)
```bash
npm run immediate
```
- **Tricky Behavior!**
- Top-level: Non-deterministic order
- Inside I/O: setImmediate runs first
- Context matters!

### 8. Advanced Scenarios (`08-advanced-scenarios.js`)
```bash
npm run advanced
```
- Complex scenarios
- Promise chains
- async/await behavior
- Event loop starvation warnings

### 9. Microtask vs Macrotask (`09-microtask-vs-macrotask.js`)
```bash
npm run microtask-vs-macrotask
```
- **Complete comparison** between Microtasks and Macrotasks
- Side-by-side examples showing execution order
- Real-world scenarios
- Clear demonstration of priority differences
- Key differences summary

### 10. Non-Blocking Architecture (`10-non-blocking-architecture.js`)
```bash
npm run non-blocking
```
- **Deep dive** into non-blocking architecture
- Blocking vs Non-blocking operations comparison
- File I/O: Synchronous vs Asynchronous
- Multiple operations: Sequential vs Parallel
- Event Loop's role in non-blocking
- CPU-intensive tasks handling
- Real-world server performance examples
- Common non-blocking patterns (Callbacks, Promises, async/await)
- Best practices and key principles

---

## 🔑 Key Concepts

### 1. **Microtasks** vs **Macrotasks**

| Microtasks | Macrotasks |
|------------|------------|
| `process.nextTick()` | `setTimeout()` |
| `Promise.then()` | `setInterval()` |
| `queueMicrotask()` | `setImmediate()` |
| **Higher Priority** | I/O callbacks |
| Queue completely exhausted | Execute in phases |

**Key Rule:** Microtasks **ALWAYS** execute before Macrotasks, even if macrotask has 0ms delay!

See `09-microtask-vs-macrotask.js` for detailed comparison with examples.

### 2. **process.nextTick() vs Promise**

```
Priority: process.nextTick > Promise.then()
```

- nextTick queue पहले completely exhausted होती है
- फिर Promise queue process होती है
- यहाँ भी nested हो सकते हैं!

### 3. **setImmediate() vs setTimeout(0)**

#### Top-level (Non-deterministic):
```javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// Order depends on event loop state!
```

#### Inside I/O callback (Deterministic):
```javascript
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // setImmediate ALWAYS runs first here!
});
```

### 4. **Event Loop Starvation**

⚠️ **Warning:** Recursive `process.nextTick()` event loop को starve कर सकता है!

```javascript
// DANGER: Blocks forever!
function starve() {
  process.nextTick(starve);
}
starve();
```

### 5. **async/await**

`async/await` internally Promises use करता है, इसलिए:
- `await` के बाद का code microtask queue में जाता है
- Behavior Promise.then() जैसा है

### 6. **Non-Blocking Architecture**

Node.js की core strength non-blocking architecture है:

#### Blocking vs Non-Blocking:

| Blocking (Synchronous) | Non-Blocking (Asynchronous) |
|------------------------|------------------------------|
| `fs.readFileSync()` | `fs.readFile()` |
| `crypto.pbkdf2Sync()` | `crypto.pbkdf2()` |
| Stops execution | Continues immediately |
| Blocks event loop | Doesn't block event loop |
| Poor performance | Excellent performance |

#### Key Mechanisms:
- **Event Loop**: Manages async operations
- **Thread Pool (libuv)**: Handles file I/O (default: 4 threads)
- **OS Async I/O**: Network operations
- **Callbacks/Promises**: Handle completion

#### Best Practices:
- ✅ Always use async APIs in production
- ✅ Avoid blocking operations (`readFileSync`, etc.)
- ✅ Break CPU tasks into chunks using `setImmediate()`
- ✅ Use Worker Threads for heavy computation
- ✅ Keep event loop responsive

See `10-non-blocking-architecture.js` for detailed examples and comparisons.

---

## 🚀 How to Run

### Run Individual Examples:
```bash
npm run basic
npm run phases
npm run nexttick
npm run microtask
npm run timers
npm run io
npm run immediate
npm run advanced
npm run microtask-vs-macrotask
npm run non-blocking
```

### Run All Examples:
```bash
npm run all
```

### Or Directly:
```bash
node 01-basic-flow.js
node 02-event-loop-phases.js
# ... etc
```

---

## 💡 Important Takeaways

1. ✅ **Synchronous code** हमेशा पहले execute होता है
2. ✅ **Microtasks** (nextTick, Promise) macrotasks से पहले
3. ✅ **process.nextTick** Promise से higher priority
4. ✅ **setImmediate** I/O callback में setTimeout से पहले
5. ✅ Event loop **never blocks** (except Poll phase waiting)
6. ⚠️ **nextTick** recursion event loop को starve कर सकता है

---

## 📖 Further Reading

- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Documentation](http://docs.libuv.org/)

---

## 🤝 Contributing

Feel free to add more examples or improve existing ones!

---

**Happy Learning! 🎓**

