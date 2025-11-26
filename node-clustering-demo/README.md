# 🔄 Node.js Clustering - Real World Examples

यह project Node.js Clustering को practically demonstrate करता है real-world examples के साथ।

## 📚 Table of Contents

1. [Clustering क्या है?](#clustering-क्या-है)
2. [Why Use Clustering?](#why-use-clustering)
3. [How Clustering Works](#how-clustering-works)
4. [Cluster vs Workers - Main Difference](#cluster-vs-workers---main-difference)
5. [Examples](#examples)
6. [Installation](#installation)
7. [How to Run](#how-to-run)

---

## 🎯 Clustering क्या है?

Node.js **single-threaded** है, लेकिन **clustering** use karke hum **multiple processes** create kar sakte hain jo **parallel mein kaam** karte hain। Har process ek **CPU core** use kar sakta hai।

### Key Benefits:
- ✅ **Better Performance**: Multiple CPU cores use hote hain
- ✅ **Load Balancing**: Requests automatically distribute hote hain
- ✅ **Fault Tolerance**: Ek worker crash hone par automatically restart hota hai
- ✅ **Zero Downtime**: Workers ko gracefully restart kar sakte hain
- ✅ **Scalability**: CPU cores ke according scale kar sakte hain

---

## 💡 Why Use Clustering?

### Without Clustering (Single Process):
```javascript
// ❌ Ek hi process, ek hi CPU core use hota hai
const server = http.createServer((req, res) => {
  // Heavy CPU work blocks entire server
  doHeavyWork();
  res.end('Done');
});
server.listen(3000);
```

### With Clustering:
```javascript
// ✅ Multiple processes, multiple CPU cores
if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Har CPU core ke liye ek worker
  }
} else {
  // Worker process - parallel mein kaam karega
  const server = http.createServer((req, res) => {
    doHeavyWork(); // Ab ek worker block hoga, baaki chalte rahenge
    res.end('Done');
  });
  server.listen(3000);
}
```

---

## 🔄 How Clustering Works

1. **Master Process**: Primary process jo workers ko manage karta hai
2. **Worker Processes**: Multiple child processes jo actual kaam karte hain
3. **IPC**: Inter-Process Communication - Master aur Workers ke beech communication
4. **Load Balancing**: Node.js automatically round-robin algorithm use karta hai

```
┌─────────────────┐
│  Master Process │
│   (Primary)     │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───┐
│Worker1│ │Worker2│ │Worker3│ │Worker4│
│ CPU 1 │ │ CPU 2 │ │ CPU 3 │ │ CPU 4 │
└───────┘ └───────┘ └───────┘ └───────┘
```

---

## 🔀 Cluster vs Workers - Main Difference

### **Cluster (क्लस्टर) क्या है?**

**Cluster** ek **module** hai Node.js mein jo multiple processes ko manage karta hai। Ye **Master Process** create karta hai jo **Workers** ko control karta hai।

#### Cluster की Features:
- ✅ **Module/API**: Node.js ka built-in module hai
- ✅ **Master Process**: Primary process jo workers ko manage karta hai
- ✅ **Process Management**: Workers create, kill, aur restart karta hai
- ✅ **Load Balancing**: Requests ko workers mein distribute karta hai
- ✅ **IPC Setup**: Workers aur Master ke beech communication setup karta hai

```javascript
import cluster from 'cluster';

// Cluster MODULE use hota hai
if (cluster.isPrimary) {
  // Master Process - Cluster ka part
  cluster.fork(); // Workers create karega
}
```

---

### **Workers (वर्कर्स) क्या है?**

**Workers** ek-ek **child process** hain jo actual kaam karte hain। Har worker ek **independent process** hai jo apna kaam parallel mein karta hai।

#### Workers की Features:
- ✅ **Child Processes**: Independent processes jo master se banaye jaate hain
- ✅ **Actual Work**: Real processing in workers mein hoti hai
- ✅ **Isolated**: Har worker ka apna memory space hota hai
- ✅ **Parallel Execution**: Sab workers ek saath kaam kar sakte hain
- ✅ **One CPU Core**: Har worker ek CPU core use kar sakta hai

```javascript
else {
  // Worker PROCESS - Actual kaam yahan hota hai
  const server = http.createServer((req, res) => {
    // Ye worker process ka kaam hai
    res.end('Hello from Worker!');
  });
  server.listen(3000);
}
```

---

### 📊 **Main Differences (मुख्य अंतर)**

| Aspect | **Cluster** | **Workers** |
|--------|-------------|-------------|
| **Type** | Module/API (Code) | Processes (Running Instances) |
| **Purpose** | Management & Control | Actual Execution |
| **Number** | Ek hi (Master Process) | Multiple (CPU cores ke according) |
| **Role** | Workers ko manage karta hai | Actual kaam karte hain |
| **Code Location** | `cluster.isPrimary` block | `else` block (worker code) |
| **Responsibility** | Creating, monitoring workers | Processing requests, handling tasks |
| **IPC** | Setup karta hai | Use karta hai |
| **Lifecycle** | Application ke saath start/end | Master se create/destroy hote hain |

---

### 💡 **Simple Analogy (सरल उदाहरण)**

```
Cluster = Manager (क्लस्टर = मैनेजर)
Workers = Employees (वर्कर्स = कर्मचारी)

Manager (Cluster):
  - Employees ko hire karta hai (cluster.fork())
  - Kaam distribute karta hai (load balancing)
  - Monitor karta hai (worker monitoring)
  - Replace karta hai agar koi mar jaye (auto restart)

Employees (Workers):
  - Actual kaam karte hain (process requests)
  - Apne task complete karte hain (handle requests)
  - Independent kaam karte hain (parallel execution)
```

---

### 🔍 **Code Example mein Difference**

```javascript
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length; // e.g., 4 CPUs

if (cluster.isPrimary) {
  // ═══════════════════════════════════════════
  // CLUSTER CODE - Master Process
  // ═══════════════════════════════════════════
  
  console.log('👑 Master Process Started');
  console.log(`📊 Creating ${numCPUs} workers...`);
  
  // Cluster module se workers create karo
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork(); // Worker create
    console.log(`✨ Worker ${worker.id} created`);
  }
  
  // Cluster workers ko monitor karta hai
  cluster.on('exit', (worker) => {
    console.log(`⚠️ Worker ${worker.id} died`);
    cluster.fork(); // New worker create karo
  });
  
} else {
  // ═══════════════════════════════════════════
  // WORKER CODE - Child Process
  // ═══════════════════════════════════════════
  
  console.log(`👷 Worker ${cluster.worker.id} started`);
  
  // Worker actual kaam karta hai
  const server = http.createServer((req, res) => {
    res.end(`Handled by Worker ${cluster.worker.id}`);
  });
  
  server.listen(3000);
  // Ye worker process port 3000 pe listen karega
}
```

**Explanation:**
- `cluster.isPrimary` → **Cluster (Master)** ka code hai
- `else` block → **Worker** ka code hai
- `cluster.fork()` → Cluster se worker create hota hai
- `cluster.worker.id` → Worker process ki identity hai

---

### ⚙️ **How They Work Together**

```
Step 1: Cluster Module Load Hoti Hai
        ↓
Step 2: Master Process Start Hota Hai (cluster.isPrimary = true)
        ↓
Step 3: Cluster.fork() Se Workers Create Hote Hain
        ↓
Step 4: Har Worker Ek Independent Process Ban Jata Hai
        ↓
Step 5: Workers Apna Kaam Parallel Mein Karte Hain
        ↓
Step 6: Cluster Unko Monitor Aur Manage Karta Hai
```

---

### 🎯 **Key Takeaways**

1. **Cluster** = Management System (मैनेजमेंट सिस्टम)
   - Workers ko create, monitor, aur manage karta hai
   - Load balancing handle karta hai
   - Master process hota hai

2. **Workers** = Execution Units (एक्जीक्यूशन यूनिट्स)
   - Actual processing karte hain
   - Independent processes hain
   - Parallel mein kaam karte hain

3. **Relationship**:
   - **1 Cluster** = **1 Master Process**
   - **1 Master** = **N Workers** (typically CPU cores ke equal)
   - **Cluster** → **Workers create/mange karta hai**
   - **Workers** → **Actual kaam karte hain**

---

## 📁 Examples

### 1. Basic Clustering (`01-basic-clustering.js`)
```bash
npm run basic
```
- Master aur Worker processes ka basic setup
- Workers kaise create hote hain
- Master-Worker communication (IPC)
- Worker lifecycle management

### 2. HTTP Server Clustering (`02-http-server-cluster.js`)
```bash
npm run http
```
- HTTP server ko cluster mein run karna
- Multiple workers ek hi port pe listen karte hain
- Requests automatically distribute hote hain
- Worker crash handling

### 3. Load Balancing Demo (`03-load-balancing-demo.js`)
```bash
npm run load-balance
```
- Round-robin load balancing demonstration
- Request distribution tracking
- Load statistics display
- Visual representation of load distribution

### 4. Zero-Downtime Restart (`04-zero-downtime-restart.js`)
```bash
npm run zero-downtime
```
- Workers ko gracefully restart karna
- Bina server down kiye workers update karna
- Current requests complete hone ka wait karna
- Production-ready restart strategy

### 5. CPU-Intensive Tasks (`05-cpu-intensive-tasks.js`)
```bash
npm run cpu-intensive
```
- Heavy computation tasks ko distribute karna
- Fibonacci calculation
- Prime number finding
- CPU-bound operations handling

### 6. Shared State Management (`06-shared-state-management.js`)
```bash
npm run shared-state
```
- Workers ke beech mein state share karna
- IPC through master process
- Shared counter example
- Request history tracking

### 7. Performance Comparison (`07-performance-comparison.js`)
```bash
npm run performance
```
- Single process vs Clustered performance
- Concurrent request handling
- Throughput comparison
- Real performance metrics

### 8. Real-World API Server (`08-real-world-api-server.js`)
```bash
npm run api-server
```
- Complete REST API with Express.js
- CRUD operations
- User management API
- Production-ready server structure

### 9. Graceful Shutdown (`09-graceful-shutdown.js`)
```bash
npm run graceful
```
- Server ko properly shutdown karna
- Active connections ko complete hone dena
- Clean resource cleanup
- Production shutdown strategy

---

## 🚀 Installation

### 1. Install Dependencies:
```bash
cd node-clustering-demo
npm install
```

### 2. Run Examples:
```bash
npm run basic
npm run http
# ... etc
```

---

## 🚀 How to Run

### Run Individual Examples:
```bash
npm run basic              # Basic clustering setup
npm run http               # HTTP server clustering
npm run load-balance       # Load balancing demo
npm run zero-downtime      # Zero-downtime restart
npm run cpu-intensive      # CPU-intensive tasks
npm run shared-state       # Shared state management
npm run performance        # Performance comparison
npm run api-server         # Real-world API server
npm run graceful           # Graceful shutdown
```

### Run All Examples:
```bash
npm run all
```

### Or Directly:
```bash
node 01-basic-clustering.js
node 02-http-server-cluster.js
# ... etc
```

---

## 🔑 Key Concepts

### 1. **Master Process (Primary)**
```javascript
if (cluster.isPrimary) {
  // Master process code
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Workers create karo
  }
}
```

### 2. **Worker Process**
```javascript
else {
  // Worker process code
  // Actual server logic yahan
  const server = http.createServer(...);
  server.listen(3000);
}
```

### 3. **IPC Communication**
```javascript
// Master se Worker ko message
worker.send({ message: 'Hello' });

// Worker se Master ko message
process.send({ type: 'update', data: ... });

// Worker message receive kare
process.on('message', (msg) => {
  // Handle message
});
```

### 4. **Graceful Shutdown**
```javascript
// Worker ko disconnect karo (new requests accept nahi karega)
worker.disconnect();

// Server close karo
server.close(() => {
  // All connections complete
  process.exit(0);
});
```

---

## 💡 Important Takeaways

1. ✅ Clustering **multiple CPU cores** use karta hai
2. ✅ **Load balancing** automatically hota hai (round-robin)
3. ✅ **Fault tolerance** - crashed workers automatically restart hote hain
4. ✅ **Zero-downtime** deployments possible hain
5. ✅ **CPU-intensive tasks** ko distribute kiya ja sakta hai
6. ✅ **Shared state** master process ke through manage hota hai

---

## ⚠️ Important Notes

### When to Use Clustering:
✅ **Use for:**
- CPU-intensive applications
- High-traffic HTTP servers
- Multiple CPU cores available
- Need for fault tolerance
- Better resource utilization

❌ **Don't use for:**
- I/O-bound operations (streams/worker-threads better)
- Small applications with low traffic
- Single CPU systems
- Applications with heavy shared state (use Redis instead)

### Limitations:
- Workers **don't share memory** directly
- Heavy shared state management overhead
- IPC communication overhead
- More complex debugging

---

## 🛠️ Technologies Used

- **Node.js Cluster Module** (Native)
- **Express.js** (HTTP framework)
- **os module** (CPU detection)
- **http module** (HTTP servers)

---

## 📖 Further Reading

- [Node.js Cluster Official Docs](https://nodejs.org/api/cluster.html)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [Load Balancing Strategies](https://en.wikipedia.org/wiki/Load_balancing_(computing))

---

## 🌟 Real-World Use Cases

1. **API Servers**: High-traffic REST APIs
2. **Web Servers**: Static file serving with high concurrency
3. **Compute Services**: Data processing, image processing
4. **Microservices**: Service instances scaling

---

**Happy Learning! 🎓**

