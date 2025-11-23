# 🚀 Node.js Advanced Concepts - Complete Learning Guide

यह repository Node.js के advanced concepts को practically और deeply समझने के लिए बनाया गया है। यहाँ तीन comprehensive projects हैं जो real-world examples के साथ concepts explain करते हैं।

## 📚 Table of Contents

1. [Projects Overview](#projects-overview)
2. [Event Loop Internals](#-event-loop-internals)
3. [Worker Threads](#-worker-threads)
4. [Streams & Pipelines](#-streams--pipelines)
5. [Quick Start](#-quick-start)
6. [Learning Path](#-learning-path)
7. [Key Concepts](#-key-concepts)

---

## 📦 Projects Overview

इस repository में तीन main projects हैं:

| Project | Description | Examples |
|---------|-------------|----------|
| **Event Loop Internals** | Node.js Event Loop का deep dive | 10 examples |
| **Worker Threads** | Parallel processing with worker threads | 6 examples |
| **Streams & Pipelines** | Memory-efficient data processing | 9 examples |

---

## 🔄 Event Loop Internals

Node.js Event Loop के बारे में complete understanding - phases, microtasks, macrotasks, और execution order।

### 📁 Location
```
event-loop-internals/
```

### 🎯 What You'll Learn

- Event Loop phases (Timers, Poll, Check, etc.)
- Microtasks vs Macrotasks
- `process.nextTick()` vs `Promise.then()`
- `setTimeout()` vs `setImmediate()`
- Non-blocking architecture
- Execution order और priority

### 📋 Examples (10 Files)

1. **Basic Flow** - Synchronous → Microtasks → Macrotasks
2. **Event Loop Phases** - All 6 phases demonstration
3. **nextTick vs Promise** - Priority differences
4. **Microtask Queue** - Deep dive into microtasks
5. **Timers** - `setTimeout()` और `setInterval()` behavior
6. **I/O Operations** - File system operations
7. **setImmediate vs setTimeout** - Context-dependent behavior
8. **Advanced Scenarios** - Complex event loop scenarios
9. **Microtask vs Macrotask** - Complete comparison
10. **Non-Blocking Architecture** - Blocking vs Non-blocking

### 🚀 Quick Start

```bash
cd event-loop-internals
npm install
npm run basic          # Start with basic example
npm run all            # Run all examples
```

### 📖 Full Documentation
[Event Loop Internals README](./event-loop-internals/README.md)

---

## 🧵 Worker Threads

CPU-intensive tasks के लिए worker threads का practical use - image compression के real example के साथ।

### 📁 Location
```
worker-threads-demo/
```

### 🎯 What You'll Learn

- Worker threads कैसे काम करते हैं
- Main thread vs Worker thread
- Parallel processing
- Worker pool pattern
- Real-world image compression
- Performance optimization

### 📋 Examples (6 Files)

1. **Basic Worker** - Simple worker thread example
2. **Image Compression - Blocking** - ❌ Blocking approach (bad)
3. **Image Compression - Worker** - ✅ Worker thread approach (good)
4. **Multiple Workers** - Processing multiple images in parallel
5. **Worker Pool** - Efficient worker reuse
6. **Performance Comparison** - Blocking vs Non-blocking comparison

### 🚀 Quick Start

```bash
cd worker-threads-demo
npm install

# Add test images to ./images/ folder
mkdir images
# Copy some JPEG/PNG images

npm run basic          # Basic example (no images needed)
npm run image-worker   # Image compression with workers
npm run compare        # Performance comparison
```

### 📖 Full Documentation
[Worker Threads README](./worker-threads-demo/README.md)

---

## 🌊 Streams & Pipelines

Memory-efficient data processing with streams - large files, CSV processing, HTTP streaming, और log processing।

### 📁 Location
```
streams-pipelines-demo/
```

### 🎯 What You'll Learn

- Readable, Writable, Transform streams
- Using `pipeline()` function
- File streaming operations
- CSV file processing
- HTTP streaming
- Large file handling
- Log processing
- Backpressure handling

### 📋 Examples (9 Files)

1. **Basic Streams** - Readable, Writable, Transform
2. **Pipelines** - Using `pipeline()` with error handling
3. **File Streaming** - Memory-efficient file operations
4. **Transform Streams** - Custom data transformation
5. **CSV Processing** - Large CSV file handling
6. **HTTP Streaming** - Streaming HTTP requests/responses
7. **Large File Handling** - Files larger than RAM
8. **Log Processing** - Real-time log analysis
9. **Backpressure Handling** - Flow control

### 🚀 Quick Start

```bash
cd streams-pipelines-demo
npm install
npm run basic          # Start with basic streams
npm run file           # File streaming
npm run csv            # CSV processing
npm run all            # Run all examples
```

### 📖 Full Documentation
[Streams & Pipelines README](./streams-pipelines-demo/README.md)

---

## 🚀 Quick Start

### Clone Repository
```bash
git clone <repository-url>
cd sachinfolder
```

### Install All Dependencies

```bash
# Event Loop Internals
cd event-loop-internals
npm install

# Worker Threads
cd ../worker-threads-demo
npm install

# Streams & Pipelines
cd ../streams-pipelines-demo
npm install
```

### Run Examples

```bash
# Event Loop
cd event-loop-internals
npm run basic

# Worker Threads
cd ../worker-threads-demo
npm run basic

# Streams
cd ../streams-pipelines-demo
npm run basic
```

---

## 📖 Learning Path

### Step 1: Event Loop Internals (Foundation)
**Why Start Here?**
- Node.js की core architecture समझने के लिए
- Asynchronous execution कैसे काम करता है
- Microtasks और Macrotasks का difference

**Recommended Order:**
1. `01-basic-flow.js` - Basic execution order
2. `02-event-loop-phases.js` - All phases
3. `09-microtask-vs-macrotask.js` - Key differences
4. `10-non-blocking-architecture.js` - Architecture understanding

### Step 2: Worker Threads (Parallelism)
**Why Next?**
- CPU-intensive tasks handle करने के लिए
- True parallelism समझने के लिए
- Performance optimization

**Recommended Order:**
1. `01-basic-worker.js` - Basic worker concept
2. `03-image-compression-worker.js` - Real example
3. `06-performance-comparison.js` - See the difference

### Step 3: Streams & Pipelines (Data Processing)
**Why Last?**
- Large data handle करने के लिए
- Memory-efficient operations
- Real-world data processing

**Recommended Order:**
1. `01-basic-streams.js` - Basic streams
2. `02-pipelines.js` - Pipeline usage
3. `03-file-streaming.js` - File operations
4. `05-csv-processing.js` - Real-world CSV

---

## 🔑 Key Concepts

### 1. Event Loop
- **Single-threaded** execution model
- **6 phases**: Timers, Pending, Idle, Poll, Check, Close
- **Microtasks** (higher priority): `process.nextTick()`, `Promise.then()`
- **Macrotasks** (lower priority): `setTimeout()`, `setImmediate()`, I/O

### 2. Worker Threads
- **True parallelism** - separate threads
- **CPU-intensive tasks** - image processing, encryption, calculations
- **Non-blocking** - main thread stays responsive
- **Worker pools** - efficient worker reuse

### 3. Streams
- **Memory efficient** - process data in chunks
- **Large files** - handle files larger than RAM
- **Pipelines** - chain multiple streams
- **Backpressure** - automatic flow control

---

## 💡 Important Takeaways

### Event Loop
1. ✅ Synchronous code हमेशा पहले execute होता है
2. ✅ Microtasks macrotasks से पहले execute होते हैं
3. ✅ `process.nextTick` Promise से higher priority
4. ✅ Event loop never blocks (except Poll phase waiting)

### Worker Threads
1. ✅ Use for CPU-intensive tasks
2. ✅ Main thread stays responsive
3. ✅ True parallelism with multiple cores
4. ✅ Worker pools for efficiency

### Streams
1. ✅ Memory efficient - only chunks in memory
2. ✅ Can handle files larger than RAM
3. ✅ Use `pipeline()` for error handling
4. ✅ Automatic backpressure handling

---

## 🛠️ Technologies Used

- **Node.js** (Native APIs)
- **Event Loop** (libuv)
- **Worker Threads** (`worker_threads` module)
- **Streams** (`stream` module)
- **Sharp** (Image processing)
- **csv-parse/csv-stringify** (CSV processing)

---

## 📚 Further Reading

### Official Documentation
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Streams](https://nodejs.org/api/stream.html)

### Related Topics
- [libuv Documentation](http://docs.libuv.org/)
- [Streams Handbook](https://github.com/substack/stream-handbook)

---

## 🎯 Project Structure

```
sachinfolder/
├── README.md                    # This file
├── event-loop-internals/        # Event Loop project
│   ├── 01-basic-flow.js
│   ├── 02-event-loop-phases.js
│   ├── ...
│   └── 10-non-blocking-architecture.js
├── worker-threads-demo/         # Worker Threads project
│   ├── 01-basic-worker.js
│   ├── workers/
│   │   ├── basic-worker.js
│   │   └── image-compression-worker.js
│   └── ...
└── streams-pipelines-demo/      # Streams project
    ├── 01-basic-streams.js
    ├── 02-pipelines.js
    └── ...
```

---

## 🤝 Contributing

Feel free to:
- Add more examples
- Improve existing code
- Fix bugs
- Add documentation
- Share feedback

---

## 📝 License

ISC

---

## 🎓 Learning Tips

1. **Start with basics** - Don't skip foundational concepts
2. **Run examples** - See code in action
3. **Modify code** - Experiment with examples
4. **Read comments** - Detailed explanations in code
5. **Practice** - Build your own examples

---

## ⭐ Key Highlights

- ✅ **25+ Real Examples** across 3 projects
- ✅ **Practical Use Cases** - Real-world scenarios
- ✅ **Complete Documentation** - Detailed explanations
- ✅ **Progressive Learning** - From basics to advanced
- ✅ **Hands-on Practice** - Run and modify examples

---

## 🚀 Get Started Now!

```bash
# Clone and explore
git clone <repository-url>
cd sachinfolder

# Start with Event Loop
cd event-loop-internals
npm install && npm run basic

# Then Worker Threads
cd ../worker-threads-demo
npm install && npm run basic

# Finally Streams
cd ../streams-pipelines-demo
npm install && npm run basic
```

---

**Happy Learning! 🎓**

*Master Node.js internals, worker threads, and streams with practical examples!*
