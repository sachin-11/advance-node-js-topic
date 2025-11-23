// ============================================
// Basic Worker Thread Implementation
// ============================================

import { parentPort } from 'worker_threads';

// Check if running as a worker thread
if (!parentPort) {
  console.error('❌ This file must be run as a worker thread, not directly!');
  process.exit(1);
}

// Listen for messages from main thread
parentPort.on('message', (data) => {
  console.log('📥 Worker: Received message:', data.message);
  console.log('📥 Worker: Received numbers:', data.numbers);
  
  // Do some computation (simulating CPU-intensive work)
  console.log('⚙️  Worker: Processing...');
  
  // Simulate heavy computation
  const start = Date.now();
  let result = 0;
  for (let i = 0; i < 100000000; i++) {
    result += i;
  }
  const processingTime = Date.now() - start;
  
  // Calculate sum of numbers
  const sum = data.numbers.reduce((a, b) => a + b, 0);
  
  // Send result back to main thread
  parentPort.postMessage({
    originalMessage: data.message,
    sum: sum,
    computationResult: result,
    processingTime: `${processingTime}ms`,
    message: 'Processing complete!'
  });
  
  console.log('✅ Worker: Processing complete');
});

