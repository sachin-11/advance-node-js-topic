# 🔄 Event Loop Phases - Short Note

## 📚 Event Loop क्या है?

Event Loop Node.js ka **core mechanism** hai jo **non-blocking I/O** ko enable karta hai। Ye single-threaded environment mein **concurrent operations** ko handle karta hai।

---

## 🔄 6 Main Phases of Event Loop

### **1. TIMERS PHASE** ⏰
- **Purpose**: setTimeout() aur setInterval() callbacks execute hote hain
- **When**: Jab timer complete ho jata hai
- **Example**:
  ```javascript
  setTimeout(() => console.log('Timer'), 1000);
  ```

### **2. PENDING CALLBACKS PHASE** ⚠️
- **Purpose**: Previous iteration ke deferred callbacks execute hote hain
- **When**: Usually I/O errors ya deferred operations
- **Note**: Mostly empty hota hai normal operation mein

### **3. IDLE/PREPARE PHASE** 🔧
- **Purpose**: Internal use (Node.js ke liye)
- **When**: Between phases

### **4. POLL PHASE** 📡
- **Purpose**: 
  - New I/O events fetch karta hai
  - I/O-related callbacks execute karta hai
  - Network requests, file operations, etc.
- **When**: Jab I/O operations complete hote hain
- **Example**:
  ```javascript
  fs.readFile('file.txt', (err, data) => {
    // Ye poll phase mein execute hoga
  });
  ```

### **5. CHECK PHASE** ✅
- **Purpose**: setImmediate() callbacks execute hote hain
- **When**: Poll phase complete hone ke baad
- **Example**:
  ```javascript
  setImmediate(() => console.log('Check phase'));
  ```

### **6. CLOSE CALLBACKS PHASE** 🔒
- **Purpose**: Close event callbacks execute hote hain
- **When**: Streams, sockets close hote hain
- **Example**:
  ```javascript
  stream.on('close', () => {
    // Ye close phase mein execute hoga
  });
  ```

---

## ⚡ Microtask Queues (Between Phases)

Event loop har phase ke **BETWEEN** microtasks execute karta hai:

### **1. nextTick Queue** 🎯 (Highest Priority)
- `process.nextTick()` callbacks
- **Priority**: Sabse zyada (even Promise.then() se pehle)

### **2. Promise Queue** ⚡
- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `queueMicrotask()` callbacks

---

## 📊 Execution Order

```
┌─────────────────────────────────────┐
│  1. Synchronous Code (Main Thread)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. process.nextTick() Queue        │ ← Highest Priority
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  3. Promise Queue (Microtasks)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. Timers Phase                    │
│     - setTimeout()                  │
│     - setInterval()                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  5. Pending Callbacks               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  6. Poll Phase                      │
│     - I/O operations                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  7. Check Phase                     │
│     - setImmediate()                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  8. Close Callbacks                 │
└──────────────┬──────────────────────┘
               │
         (Loop repeats)
```

---

## 💡 Key Points

### ✅ **Priority Order** (Highest to Lowest):
1. **Synchronous Code** - Pehle execute hota hai
2. **process.nextTick()** - Sabse zyada priority
3. **Promise.then()** - Microtask queue
4. **Timers** - setTimeout, setInterval
5. **I/O Operations** - File, Network operations
6. **setImmediate()** - Check phase
7. **Close Callbacks** - Cleanup operations

### ⚠️ **Important Notes**:

1. **Microtasks Block Macrotasks**:
   - Agar microtask queue mein bahut saare tasks hain, to macrotasks wait karte hain
   - Event loop **ALL** microtasks complete karta hai phir next phase pe jata hai

2. **process.nextTick() is Special**:
   - Ye **even Promise.then() se pehle** execute hota hai
   - Har phase ke baad immediately execute hota hai
   - Use carefully - too many can starve event loop!

3. **Blocking Code Affects Everything**:
   - Synchronous blocking code **entire event loop** ko block karta hai
   - Isliye always prefer async operations

4. **Event Loop is Single-Threaded**:
   - Har phase **one by one** execute hota hai
   - Kabhi parallel nahi hota (unless clustering/worker threads use karo)

---

## 🎯 Real-World Example

```javascript
console.log('1. Sync code');

setTimeout(() => console.log('6. Timer'), 0);

Promise.resolve().then(() => console.log('3. Promise'));

process.nextTick(() => console.log('2. NextTick'));

setImmediate(() => console.log('7. setImmediate'));

fs.readFile('file.txt', () => {
  console.log('5. I/O callback');
  process.nextTick(() => console.log('4. NextTick in I/O'));
});

console.log('1. Sync code continues');

// Output:
// 1. Sync code
// 1. Sync code continues
// 2. NextTick
// 3. Promise
// 4. NextTick in I/O  (executes before I/O completes)
// 5. I/O callback
// 6. Timer
// 7. setImmediate
```

---

## 📖 Further Reading

- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Event Loop Visualization](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

**Happy Learning! 🎓**

