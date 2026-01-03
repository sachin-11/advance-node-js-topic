# 🔄 Microservices vs Monolithic Architecture

Simple explanation with examples - Samajh mein aane wala format.

---

## 📋 Table of Contents

1. [Monolithic Architecture](#monolithic-architecture)
2. [Microservices Architecture](#microservices-architecture)
3. [Comparison](#comparison)
4. [Service Communication](#service-communication)
5. [API Gateway](#api-gateway)
6. [Service Discovery](#service-discovery)

---

## 🏛️ Monolithic Architecture

### Kya Hai?

**Ek hi bada application** jismein sab kuch hota hai - frontend, backend, database sab ek saath.

### Structure

```
┌─────────────────────────────────────────────────┐
│         Monolithic Application                  │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  Users   │  │  Videos  │    │
│  │  Module  │  │  Module  │  │  Module  │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Comments │  │  Search  │  │  Upload  │    │
│  │ Module   │  │  Module  │  │  Module  │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│         ┌──────────────────┐                   │
│         │   Database      │                   │
│         └──────────────────┘                   │
└─────────────────────────────────────────────────┘
```

### Example: YouTube Monolithic

```javascript
// Ek hi codebase mein sab kuch
app/
├── routes/
│   ├── auth.js        // Login, Signup
│   ├── videos.js      // Upload, Stream
│   ├── comments.js    // Comments
│   └── search.js      // Search
├── controllers/
│   ├── authController.js
│   ├── videoController.js
│   └── commentController.js
└── models/
    ├── User.js
    ├── Video.js
    └── Comment.js
```

### Advantages ✅

- **Simple**: Ek hi codebase, easy to understand
- **Easy Development**: Sab kuch ek jagah
- **Easy Testing**: Local pe test karna easy
- **Fast**: Same process mein, no network calls

### Disadvantages ❌

- **Scaling Problem**: Ek module slow hai to pura app slow
- **Deployment**: Ek chhota change bhi pura app redeploy
- **Technology Lock**: Ek language/framework mein stuck
- **Team Conflicts**: Multiple teams ek codebase pe kaam

---

## 🧩 Microservices Architecture

### Kya Hai?

**Chhote chhote independent services** - har service apna kaam karta hai.

### Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Mobile/Web)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  API Gateway   │
            └────────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │  Video   │  │ Comment  │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │            │
     ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│   DB 1   │  │   DB 2   │  │   DB 3   │
└──────────┘  └──────────┘  └──────────┘
```

### Example: YouTube Microservices

```
Services:
├── auth-service/          // Login, Signup
│   ├── routes/auth.js
│   ├── controllers/
│   └── database: users_db
│
├── video-service/         // Upload, Stream
│   ├── routes/videos.js
│   ├── controllers/
│   └── database: videos_db
│
├── comment-service/       // Comments
│   ├── routes/comments.js
│   ├── controllers/
│   └── database: comments_db
│
└── search-service/        // Search
    ├── routes/search.js
    └── database: elasticsearch
```

### Advantages ✅

- **Independent Scaling**: Har service alag scale kar sakta hai
- **Independent Deployment**: Ek service update, baaki pe effect nahi
- **Technology Freedom**: Har service alag language use kar sakta hai
- **Team Independence**: Har team apna service maintain kare
- **Fault Isolation**: Ek service fail, baaki chalte rahenge

### Disadvantages ❌

- **Complex**: Network calls, service discovery, etc.
- **More Resources**: Har service ke liye separate server
- **Debugging**: Multiple services mein issue find karna mushkil
- **Data Consistency**: Distributed transactions complex

---

## ⚖️ Comparison

| Feature | Monolithic | Microservices |
|---------|-----------|---------------|
| **Structure** | Ek bada app | Chhote services |
| **Deployment** | Ek unit | Har service alag |
| **Scaling** | Pura app scale | Har service alag scale |
| **Technology** | Ek language | Multiple languages |
| **Database** | Ek database | Har service ka apna DB |
| **Complexity** | Simple | Complex |
| **Development** | Fast start | Slow start |
| **Team Size** | Small team | Multiple teams |

### Kab Kya Use Karein?

**Monolithic Use Karein Jab:**
- Small team hai
- Simple application hai
- Fast development chahiye
- Scale ki zarurat nahi

**Microservices Use Karein Jab:**
- Large team hai
- Complex application hai
- Different services ko alag scale karna hai
- Different technologies use karni hai

---

## 📡 Service Communication

### Problem

Microservices mein services ko ek dusre se baat karni padti hai. Kaise?

### Solutions

#### 1. Synchronous Communication (HTTP/REST)

**Direct API calls** - ek service dusre service ko call karta hai.

```
┌──────────┐                    ┌──────────┐
│  Video   │───HTTP Request───▶│ Comment  │
│ Service  │                    │ Service  │
└──────────┘                    └──────────┘
     │                                │
     │  GET /comments?video_id=123   │
     │                                │
     │◀───Response───────────────────│
     │     {comments: [...]}         │
```

**Example:**
```javascript
// Video Service se Comment Service ko call
const response = await fetch('http://comment-service/api/comments?video_id=123');
const comments = await response.json();
```

**Pros:**
- Simple, easy to understand
- Direct communication

**Cons:**
- Services tightly coupled
- Ek service down to dusra fail
- Network latency

#### 2. Asynchronous Communication (Message Queue)

**Events/Message Queue** - ek service event publish karta hai, dusra consume karta hai.

```
┌──────────┐                    ┌──────────┐
│  Video   │                    │ Comment  │
│ Service  │                    │ Service  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  Publish Event                │
     │  "video_uploaded"             │
     │                               │
     ▼                               ▼
┌─────────────────────────────────────────┐
│         Message Queue (Kafka/RabbitMQ)   │
│                                         │
│  Topic: video_events                   │
│  Event: {video_id: 123, action: "upload"}│
└─────────────────────────────────────────┘
     │                               │
     │  Consume Event                │
     │                               │
     │                               │
```

**Example:**
```javascript
// Video Service - Event Publish
await kafka.publish('video_events', {
  video_id: 123,
  action: 'uploaded',
  user_id: 456
});

// Comment Service - Event Consume
kafka.subscribe('video_events', (event) => {
  if (event.action === 'uploaded') {
    // Initialize comment system for video
  }
});
```

**Pros:**
- Loose coupling
- Ek service down to bhi events queue mein rahenge
- Better scalability

**Cons:**
- Complex setup
- Eventual consistency (data thoda late update hoga)

#### 3. gRPC (High Performance)

**Binary protocol** - fast communication, mostly internal services ke beech.

```
┌──────────┐                    ┌──────────┐
│  Video   │───gRPC Call──────▶│ Comment  │
│ Service  │                    │ Service  │
└──────────┘                    └──────────┘
```

**Pros:**
- Very fast (binary protocol)
- Type-safe
- Good for internal services

**Cons:**
- Complex setup
- Browser support limited

---

## 🚪 API Gateway

### Problem

Client ko har service ka address pata hona chahiye? Nahi!

### Solution: API Gateway

**Ek single entry point** - client sirf gateway ko call karta hai, gateway saare services ko route karta hai.

### Without API Gateway ❌

```
Client
  ├──→ auth-service:8080/api/login
  ├──→ video-service:8081/api/videos
  ├──→ comment-service:8082/api/comments
  └──→ search-service:8083/api/search
```

**Problems:**
- Client ko har service ka address pata hona chahiye
- CORS issues
- Multiple authentication calls

### With API Gateway ✅

```
                    ┌──────────────┐
Client ────────────▶│ API Gateway  │
                    │  (Port 80)   │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│   Auth   │      │  Video   │      │ Comment  │
│ Service  │      │ Service  │      │ Service  │
└──────────┘      └──────────┘      └──────────┘
```

### API Gateway Ke Kaam

```
┌─────────────────────────────────────────────┐
│           API Gateway Functions             │
├─────────────────────────────────────────────┤
│                                             │
│  1. Request Routing                         │
│     /api/auth/*      → auth-service         │
│     /api/videos/*    → video-service        │
│     /api/comments/*  → comment-service      │
│                                             │
│  2. Authentication                          │
│     - JWT validation                        │
│     - Rate limiting                         │
│                                             │
│  3. Load Balancing                          │
│     - Distribute requests                   │
│                                             │
│  4. Caching                                 │
│     - Cache responses                       │
│                                             │
│  5. Logging & Monitoring                    │
│     - Request logs                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Example: Express.js API Gateway

```javascript
// API Gateway
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Route to different services
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:3001',
  changeOrigin: true
}));

app.use('/api/videos', createProxyMiddleware({
  target: 'http://video-service:3002',
  changeOrigin: true
}));

app.use('/api/comments', createProxyMiddleware({
  target: 'http://comment-service:3003',
  changeOrigin: true
}));

app.listen(80);
```

### Popular API Gateways

- **Kong**: Open source API gateway
- **AWS API Gateway**: AWS managed
- **Nginx**: Simple reverse proxy
- **Zuul**: Netflix API gateway
- **Express Gateway**: Node.js based

---

## 🔍 Service Discovery

### Problem

Services ko ek dusre ka address kaise pata chale? IP addresses change hote rahte hain!

### Solution: Service Discovery

**Service Registry** - ek central place jahan services apna address register karte hain.

### Types

#### 1. Client-Side Discovery

**Client directly registry se service address fetch karta hai.**

```
┌──────────┐                    ┌──────────────┐
│  Client  │───Get Service───▶│   Registry   │
│          │                    │  (Eureka/    │
│          │◀───Return IP───────│   Consul)    │
└────┬─────┘                    └──────────────┘
     │
     │ Direct call with IP
     │
     ▼
┌──────────┐
│ Service  │
└──────────┘
```

**Example:**
```javascript
// Client
const registry = new ServiceRegistry();

// Get service address
const videoServiceUrl = await registry.getService('video-service');
// Returns: http://192.168.1.10:3002

// Call service
const response = await fetch(`${videoServiceUrl}/api/videos`);
```

#### 2. Server-Side Discovery

**Load Balancer/API Gateway registry se address fetch karta hai.**

```
┌──────────┐                    ┌──────────────┐
│  Client  │                    │   Registry   │
│          │                    │              │
└────┬─────┘                    └──────┬───────┘
     │                                 │
     │ Request                         │ Get Service
     │                                 │
     ▼                                 ▼
┌─────────────────────────────────────────┐
│      Load Balancer / API Gateway        │
│                                          │
│  1. Receive request                     │
│  2. Query registry for service          │
│  3. Route to service                    │
└─────────────────────────────────────────┘
     │
     │ Route
     │
     ▼
┌──────────┐
│ Service  │
└──────────┘
```

### Service Registry Flow

```
┌─────────────────────────────────────────────────────┐
│              Service Registration Flow              │
└─────────────────────────────────────────────────────┘

Step 1: Service Start
┌──────────┐
│ Service  │───Register───┐
│ Starts   │              │
└──────────┘              │
                          ▼
                 ┌──────────────┐
                 │   Registry   │
                 │              │
                 │  Service:    │
                 │  video-svc   │
                 │  IP: 10.0.1.5│
                 │  Port: 3002  │
                 └──────────────┘

Step 2: Health Check
┌──────────┐                    ┌──────────────┐
│ Service  │◀───Health Check───│   Registry   │
│          │                    │              │
│          │───OK───────────────▶              │
└──────────┘                    └──────────────┘

Step 3: Service Discovery
┌──────────┐                    ┌──────────────┐
│  Client  │───Get Service───▶│   Registry   │
│          │                    │              │
│          │◀───Return IP───────│              │
└──────────┘                    └──────────────┘
```

### Popular Service Discovery Tools

#### 1. **Consul** (HashiCorp)
```javascript
// Service Registration
const consul = require('consul')();

consul.agent.service.register({
  name: 'video-service',
  address: '192.168.1.10',
  port: 3002,
  check: {
    http: 'http://192.168.1.10:3002/health',
    interval: '10s'
  }
});

// Service Discovery
const services = await consul.health.service({
  service: 'video-service',
  passing: true
});
```

#### 2. **Eureka** (Netflix)
- Java based
- Spring Cloud integration
- Self-registration

#### 3. **etcd** (Kubernetes)
- Key-value store
- Used by Kubernetes
- Distributed

#### 4. **Zookeeper** (Apache)
- Distributed coordination
- Used by Kafka
- Complex setup

### Kubernetes Service Discovery

Kubernetes mein built-in service discovery hota hai:

```yaml
# Service Definition
apiVersion: v1
kind: Service
metadata:
  name: video-service
spec:
  selector:
    app: video
  ports:
    - port: 80
      targetPort: 3002
```

**Usage:**
```javascript
// Services ko name se access kar sakte hain
const response = await fetch('http://video-service/api/videos');
// Kubernetes automatically resolve karega
```

---

## 🎯 Real-World Example: YouTube Architecture

### Monolithic Approach

```
┌─────────────────────────────────────┐
│      YouTube Monolithic App         │
│                                     │
│  /auth      → Auth Module           │
│  /videos    → Video Module          │
│  /comments  → Comment Module        │
│  /search    → Search Module         │
│                                     │
│  All in one codebase                │
└─────────────────────────────────────┘
```

**Deployment:**
```bash
# Ek hi deployment
npm start  # Pura app start
```

### Microservices Approach

```
                    ┌──────────────┐
Client ────────────▶│ API Gateway  │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│   Auth   │      │  Video   │      │ Comment  │
│ Service  │      │ Service  │      │ Service  │
│ :3001    │      │ :3002    │      │ :3003    │
└──────────┘      └──────────┘      └──────────┘
```

**Deployment:**
```bash
# Har service alag deploy
cd auth-service && npm start      # Port 3001
cd video-service && npm start     # Port 3002
cd comment-service && npm start  # Port 3003
```

**Service Communication:**
```javascript
// Video Service se Comment Service ko call
const commentServiceUrl = await serviceRegistry.get('comment-service');
const comments = await fetch(`${commentServiceUrl}/api/comments?video_id=123`);
```

---

## 📊 Quick Summary

### Monolithic
- ✅ Simple, fast development
- ❌ Scaling issues
- ✅ Ek deployment
- ❌ Technology lock

### Microservices
- ✅ Independent scaling
- ❌ Complex setup
- ✅ Technology freedom
- ❌ More resources needed

### Service Communication
- **Synchronous**: HTTP/REST (direct calls)
- **Asynchronous**: Message Queue (events)
- **High Performance**: gRPC (internal)

### API Gateway
- Single entry point
- Request routing
- Authentication
- Load balancing
- Caching

### Service Discovery
- **Client-Side**: Client registry se fetch kare
- **Server-Side**: Gateway/LB registry se fetch kare
- **Tools**: Consul, Eureka, etcd, Kubernetes

---

## 🚀 When to Use What?

**Start with Monolithic:**
- Small team
- Simple app
- Fast MVP

**Move to Microservices:**
- Team grow ho gaya
- Different scaling needs
- Multiple teams
- Complex domain

**Remember:** Microservices complexity add karte hain. Start simple, scale when needed!

---

**End of Document**

