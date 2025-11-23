# ⚡ Event Loop Quick Reference Guide

## 🎯 एक नज़र में समझें

```
┌─────────────────────────────────────────────────────────┐
│              NODE.JS EVENT LOOP                          │
└─────────────────────────────────────────────────────────┘

1️⃣ SYNCHRONOUS CODE (सबसे पहले)
   └─ Script runs top to bottom
   
2️⃣ MICROTASKS (Microtask Queue)
   ├─ process.nextTick() ← HIGHEST PRIORITY
   ├─ Promise.then()
   └─ queueMicrotask()
   
3️⃣ MACROTASKS (Event Loop Phases)
   ├─ Phase 1: Timers (setTimeout, setInterval)
   ├─ Phase 2: Pending Callbacks
   ├─ Phase 3: Idle, Prepare
   ├─ Phase 4: Poll (I/O operations)
   ├─ Phase 5: Check (setImmediate)
   └─ Phase 6: Close Callbacks
   
└─ Repeat from Phase 1 (if callbacks exist)
```

---

## 📋 Execution Order (Priority)

```
1. Synchronous Code
   ↓
2. process.nextTick() ← सभी nextTick exhaust होते हैं
   ↓
3. Promise.then() / queueMicrotask() ← फिर Promise queue
   ↓
4. Timers Phase (setTimeout)
   ↓
5. Pending Callbacks Phase
   ↓
6. Poll Phase (I/O)
   ↓
7. Check Phase (setImmediate)
   ↓
8. Close Callbacks Phase
   ↓
   (Loop repeats)
```

---

## 🔑 Key Rules

### Rule 1: Microtasks > Macrotasks
```javascript
console.log('1. Sync');
setTimeout(() => console.log('3. setTimeout'), 0);
Promise.resolve().then(() => console.log('2. Promise'));
// Output: 1, 2, 3
```

### Rule 2: nextTick > Promise
```javascript
Promise.resolve().then(() => console.log('2. Promise'));
process.nextTick(() => console.log('1. nextTick'));
// Output: 1, 2
```

### Rule 3: Inside I/O, setImmediate > setTimeout
```javascript
fs.readFile(__filename, () => {
  setTimeout(() => console.log('2. setTimeout'), 0);
  setImmediate(() => console.log('1. setImmediate'));
});
// Output: 1, 2
```

### Rule 4: Top-level, order is non-deterministic
```javascript
setTimeout(() => console.log('?'), 0);
setImmediate(() => console.log('?'));
// Order can vary!
```

---

## 🎨 Visual Flow

```
Start
  │
  ├─→ [SYNC] Execute all synchronous code
  │
  ├─→ [MICROTASKS] Process microtask queue
  │   ├─→ nextTick queue (completely exhausted)
  │   └─→ Promise queue (completely exhausted)
  │
  ├─→ [TIMERS] Check timer queue
  │   └─→ Execute expired timers
  │
  ├─→ [PENDING] Execute pending I/O callbacks
  │
  ├─→ [IDLE/PREPARE] Internal use
  │
  ├─→ [POLL] 
  │   ├─→ Fetch new I/O events
  │   └─→ Execute I/O callbacks
  │       └─→ [MICROTASKS] Run between callbacks
  │
  ├─→ [CHECK] Execute setImmediate callbacks
  │
  ├─→ [CLOSE] Execute close callbacks
  │
  └─→ Repeat (if callbacks exist)
```

---

## 💡 Common Patterns

### Pattern 1: Microtask Chain
```javascript
process.nextTick(() => {
  console.log('1');
  process.nextTick(() => {
    console.log('2');
  });
});
// All nextTick callbacks exhaust before moving forward
```

### Pattern 2: Promise Chain
```javascript
Promise.resolve()
  .then(() => console.log('1'))
  .then(() => console.log('2'))
  .then(() => console.log('3'));
// Each .then adds to microtask queue
```

### Pattern 3: Mixed Priorities
```javascript
setTimeout(() => console.log('3'), 0);
Promise.resolve().then(() => console.log('2'));
process.nextTick(() => console.log('1'));
console.log('0');
// Output: 0, 1, 2, 3
```

---

## ⚠️ Common Pitfalls

### ❌ Pitfall 1: Event Loop Starvation
```javascript
// BAD: Blocks forever!
function starve() {
  process.nextTick(starve);
}
starve();
```

### ❌ Pitfall 2: Assuming setTimeout(0) is immediate
```javascript
// setTimeout(0) doesn't mean "right now"
setTimeout(() => console.log('later'), 0);
console.log('now');
// Output: now, later (not immediate!)
```

### ❌ Pitfall 3: Not understanding context
```javascript
// Top-level: Non-deterministic
setTimeout(() => {}, 0);
setImmediate(() => {});

// Inside I/O: Deterministic (setImmediate first)
fs.readFile(__filename, () => {
  setTimeout(() => {}, 0);
  setImmediate(() => {}); // Runs first!
});
```

---

## 📚 Example Files Reference

| File | Focus | Run Command |
|------|-------|-------------|
| `01-basic-flow.js` | Basic execution order | `npm run basic` |
| `02-event-loop-phases.js` | All 6 phases | `npm run phases` |
| `03-nexttick-vs-promise.js` | Priority differences | `npm run nexttick` |
| `04-microtask-queue.js` | Microtask deep dive | `npm run microtask` |
| `05-timers.js` | Timer behavior | `npm run timers` |
| `06-io-operations.js` | I/O callbacks | `npm run io` |
| `07-setimmediate-vs-settimeout.js` | Tricky comparisons | `npm run immediate` |
| `08-advanced-scenarios.js` | Complex scenarios | `npm run advanced` |

---

## 🚀 Quick Start

```bash
# Run all examples
npm run all

# Or run individually
npm run basic
npm run phases
npm run nexttick
# ... etc
```

---

**Happy Coding! 🎉**

