// ============================================
// Example 5: Worker Pool Pattern
// ============================================
// Efficient worker pool that reuses workers

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Worker Pool Pattern ===\n');
console.log('💡 Reusing workers for better performance\n');

// Worker Pool Class
class WorkerPool {
  constructor(workerPath, poolSize = 4) {
    this.workerPath = workerPath;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
    
    // Initialize pool
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }
  
  createWorker() {
    const worker = new Worker(this.workerPath);
    worker.busy = false;
    
    worker.on('message', (result) => {
      this.activeWorkers--;
      worker.busy = false;
      
      // Get the resolve function from queue
      const { resolve } = this.queue.shift();
      resolve(result);
      
      // Process next task in queue
      this.processQueue();
    });
    
    worker.on('error', (error) => {
      this.activeWorkers--;
      worker.busy = false;
      const { reject } = this.queue.shift();
      reject(error);
      this.processQueue();
    });
    
    this.workers.push(worker);
  }
  
  processQueue() {
    if (this.queue.length === 0 || this.activeWorkers >= this.poolSize) {
      return;
    }
    
    // Find available worker
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) {
      return;
    }
    
    const task = this.queue.shift();
    availableWorker.busy = true;
    this.activeWorkers++;
    
    availableWorker.postMessage(task.data);
  }
  
  execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate());
  }
}

// Check if images directory exists
const imagesDir = join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('📁 Created images directory');
  console.log('💡 Please add some test images (JPEG/PNG) to ./images/ folder\n');
  process.exit(1);
}

// Find all images
const imageFiles = fs.readdirSync(imagesDir).filter(file => 
  /\.(jpg|jpeg|png|webp)$/i.test(file)
);

if (imageFiles.length === 0) {
  console.log('❌ No images found in ./images/ directory');
  console.log('💡 Please add some test images to continue\n');
  process.exit(1);
}

// Use first 5 images (or all if less than 5)
const imagesToProcess = imageFiles.slice(0, Math.min(5, imageFiles.length));

console.log(`📸 Processing ${imagesToProcess.length} images using worker pool (size: 4)...\n`);

// Create worker pool
const pool = new WorkerPool(join(__dirname, 'workers', 'image-compression-worker.js'), 4);

const start = Date.now();
const tasks = [];

// Create tasks for all images
imagesToProcess.forEach((imageFile, index) => {
  const inputImage = join(imagesDir, imageFile);
  const outputImage = join(imagesDir, `compressed-pool-${index}-${Date.now()}.jpg`);
  
  tasks.push(
    pool.execute({
      inputImage: inputImage,
      outputImage: outputImage,
      options: {
        width: 800,
        height: 600,
        quality: 70
      }
    }).then(result => {
      if (result.success) {
        console.log(`✅ Task ${index + 1} completed: ${imageFile}`);
        console.log(`   Compressed: ${result.originalSize} KB → ${result.compressedSize} KB\n`);
        return result;
      }
    }).catch(error => {
      console.error(`❌ Task ${index + 1} failed:`, error);
    })
  );
});

// Wait for all tasks to complete
Promise.all(tasks).then(() => {
  const totalTime = Date.now() - start;
  console.log('='.repeat(50));
  console.log(`🎉 All images processed in ${totalTime}ms`);
  console.log(`📊 Total images: ${imagesToProcess.length}`);
  console.log(`⚡ Average time per image: ${(totalTime / imagesToProcess.length).toFixed(2)}ms`);
  console.log('='.repeat(50));
  console.log('\n💡 Benefits of Worker Pool:');
  console.log('   • Workers are reused (no creation overhead)');
  console.log('   • Efficient resource management');
  console.log('   • Better performance for multiple tasks\n');
  
  pool.terminate();
});

/*
KEY BENEFITS OF WORKER POOL:
1. Workers are reused (no overhead of creating new workers)
2. Efficient resource management
3. Better performance for multiple tasks
4. Controlled concurrency (pool size limits)
*/

