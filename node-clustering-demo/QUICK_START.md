# 🚀 Quick Start Guide - Node.js Clustering

## Installation

```bash
cd node-clustering-demo
npm install
```

## Run Examples

### 1. Basic Clustering
```bash
npm run basic
```
Master aur workers ka basic setup dikhata hai.

### 2. HTTP Server Clustering
```bash
npm run http
```
Browser mein `http://localhost:3000` open karo, multiple requests send karo.

### 3. Load Balancing
```bash
npm run load-balance
```
Multiple requests bhejo aur dekho kaise load distribute hota hai.

### 4. Zero-Downtime Restart
```bash
npm run zero-downtime
```
Workers automatically restart honge bina server down kiye.

### 5. CPU-Intensive Tasks
```bash
npm run cpu-intensive
```
Browser mein:
- `http://localhost:3003/fibonacci?n=40`
- `http://localhost:3003/primes?max=10000`

### 6. Shared State
```bash
npm run shared-state
```
Browser mein:
- `http://localhost:3004/counter`
- `http://localhost:3004/increment`
- `http://localhost:3004/history`

### 7. Performance Comparison
```bash
npm run performance
```
Single process vs Clustered performance dekho.

### 8. Real-World API Server
```bash
npm run api-server
```
Complete REST API with clustering:
```bash
curl http://localhost:3007/api/users
curl -X POST http://localhost:3007/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

### 9. Graceful Shutdown
```bash
npm run graceful
```
Ctrl+C press karo aur dekho graceful shutdown kaise hota hai.

## Run All Examples

```bash
npm run all
```

---

## 💡 Quick Tips

1. **CPU Cores**: Clustering CPU cores ke number ke according workers create karta hai
2. **Port Sharing**: Sab workers same port pe listen karte hain (OS automatically handle karta hai)
3. **Load Balancing**: Node.js round-robin algorithm use karta hai
4. **Fault Tolerance**: Worker crash hone par automatically restart hota hai

---

**Happy Learning! 🎓**

