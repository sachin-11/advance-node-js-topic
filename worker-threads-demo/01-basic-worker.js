// ============================================
// Example 1: Basic Worker Thread
// ============================================
// Simple example showing how worker threads work

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Basic Worker Thread Example ===\n');

// Create a worker
const worker = new Worker(join(__dirname, 'workers', 'basic-worker.js'));

console.log('📤 Main Thread: Sending message to worker...');

// Send data to worker
worker.postMessage({ 
  message: 'Hello from main thread!',
  numbers: [1, 2, 3, 4, 5]
});

// Listen for messages from worker
worker.on('message', (result) => {
  console.log('📥 Main Thread: Received from worker:', result);
  
  // Terminate worker after receiving result
  worker.terminate();
});

worker.on('error', (error) => {
  console.error('❌ Worker error:', error);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Worker stopped with exit code ${code}`);
  } else {
    console.log('✅ Worker exited successfully');
  }
});

console.log('🟢 Main Thread: Continuing execution (non-blocking!)');
console.log('   Worker is processing in background...\n');

