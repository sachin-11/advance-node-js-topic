// ============================================
// Example 8: Real-World API Server with Clustering
// ============================================
// Ye example ek complete real-world API server hai clustering ke sath
// Express.js use karke REST API with clustering

import cluster from 'cluster';
import express from 'express';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3007;

// Mock database (in production, use actual database)
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
];

let userCounter = 3;

if (cluster.isPrimary) {
  console.log('='.repeat(60));
  console.log('🌐 Real-World API Server with Clustering');
  console.log('='.repeat(60));
  console.log(`📊 Total CPU Cores: ${numCPUs}`);
  console.log(`👑 Master Process ID: ${process.pid}`);
  console.log(`🚀 Starting ${numCPUs} API workers...\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`✨ API Worker ${worker.id} started (PID: ${worker.process.pid})`);
  }

  // Shared state management
  cluster.on('message', (worker, msg) => {
    if (msg.type === 'get-next-id') {
      userCounter++;
      worker.send({ type: 'next-id', id: userCounter });
    } else if (msg.type === 'user-created') {
      // Broadcast to all workers (in real app, use Redis or database)
      for (const id in cluster.workers) {
        if (cluster.workers[id].id !== worker.id) {
          cluster.workers[id].send({
            type: 'user-update',
            user: msg.user
          });
        }
      }
    }
  });

  cluster.on('exit', (worker) => {
    console.log(`\n⚠️  Worker ${worker.id} died. Restarting...`);
    const newWorker = cluster.fork();
    console.log(`✨ New Worker ${newWorker.id} started`);
  });

  console.log(`\n🌍 API Server running at http://localhost:${PORT}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   GET    /api/users          - Get all users`);
  console.log(`   GET    /api/users/:id      - Get user by ID`);
  console.log(`   POST   /api/users          - Create new user`);
  console.log(`   PUT    /api/users/:id      - Update user`);
  console.log(`   DELETE /api/users/:id      - Delete user`);
  console.log(`   GET    /api/health         - Health check`);
  console.log(`   GET    /api/stats          - Server stats`);
  console.log(`\n💡 Example:`);
  console.log(`   curl http://localhost:${PORT}/api/users`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/users -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com"}'`);
  console.log(`\n`);

} else {
  // Worker process - Express API Server
  const workerId = cluster.worker.id;
  const app = express();

  // Middleware
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('X-Worker-ID', workerId);
    res.setHeader('X-Worker-PID', process.pid);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      workerId: workerId,
      workerPid: process.pid,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Get all users
  app.get('/api/users', (req, res) => {
    console.log(`   📥 Worker ${workerId} - GET /api/users`);
    res.json({
      data: users,
      count: users.length,
      workerId: workerId
    });
  });

  // Get user by ID
  app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    console.log(`   📥 Worker ${workerId} - GET /api/users/${id}`);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        workerId: workerId
      });
    }
    
    res.json({
      data: user,
      workerId: workerId
    });
  });

  // Create user
  app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    console.log(`   📥 Worker ${workerId} - POST /api/users`);
    
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
        workerId: workerId
      });
    }

    // Get next ID from master
    process.send({ type: 'get-next-id' });
    
    process.once('message', (msg) => {
      if (msg.type === 'next-id') {
        const newUser = {
          id: msg.id,
          name,
          email,
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        // Notify master
        process.send({
          type: 'user-created',
          user: newUser
        });
        
        res.status(201).json({
          message: 'User created successfully',
          data: newUser,
          workerId: workerId
        });
        
        console.log(`   ✅ Worker ${workerId} - Created user: ${name}`);
      }
    });
  });

  // Update user
  app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    
    console.log(`   📥 Worker ${workerId} - PUT /api/users/${id}`);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        workerId: workerId
      });
    }
    
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    users[userIndex].updatedAt = new Date().toISOString();
    
    res.json({
      message: 'User updated successfully',
      data: users[userIndex],
      workerId: workerId
    });
    
    console.log(`   ✅ Worker ${workerId} - Updated user: ${id}`);
  });

  // Delete user
  app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    console.log(`   📥 Worker ${workerId} - DELETE /api/users/${id}`);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        workerId: workerId
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      message: 'User deleted successfully',
      data: deletedUser,
      workerId: workerId
    });
    
    console.log(`   ✅ Worker ${workerId} - Deleted user: ${id}`);
  });

  // Stats endpoint
  app.get('/api/stats', (req, res) => {
    res.json({
      workerId: workerId,
      workerPid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      totalUsers: users.length,
      timestamp: new Date().toISOString()
    });
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error(`   ❌ Worker ${workerId} Error:`, err);
    res.status(500).json({
      error: 'Internal server error',
      workerId: workerId
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`   👷 API Worker ${workerId} listening on port ${PORT}`);
  });
}

