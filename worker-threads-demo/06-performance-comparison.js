// ============================================
// Example 6: Performance Comparison
// ============================================
// Side-by-side comparison: Blocking vs Worker Threads

import sharp from 'sharp';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Performance Comparison: Blocking vs Worker Threads ===\n');

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

// Use first 3 images for comparison
const imagesToProcess = imageFiles.slice(0, Math.min(3, imageFiles.length));

console.log(`📸 Comparing performance with ${imagesToProcess.length} images...\n`);

// ============================================
// TEST 1: BLOCKING Approach (Sequential)
// ============================================
console.log('🔴 TEST 1: BLOCKING Approach (Sequential)');
console.log('='.repeat(50));

const blockingStart = Date.now();
const blockingResults = [];

for (let i = 0; i < imagesToProcess.length; i++) {
  const imageFile = imagesToProcess[i];
  const inputImage = join(imagesDir, imageFile);
  const outputImage = join(imagesDir, `compare-blocking-${i}-${Date.now()}.jpg`);
  
  try {
    const taskStart = Date.now();
    await sharp(inputImage)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toFile(outputImage);
    
    const taskTime = Date.now() - taskStart;
    const inputStats = fs.statSync(inputImage);
    const outputStats = fs.statSync(outputImage);
    
    blockingResults.push({
      image: imageFile,
      time: taskTime,
      originalSize: (inputStats.size / 1024).toFixed(2),
      compressedSize: (outputStats.size / 1024).toFixed(2)
    });
    
    console.log(`  ✅ ${imageFile}: ${taskTime}ms`);
  } catch (error) {
    console.error(`  ❌ ${imageFile}: ${error.message}`);
  }
}

const blockingTotal = Date.now() - blockingStart;
console.log(`\n⏱️  Total time: ${blockingTotal}ms`);
console.log(`📊 Average per image: ${(blockingTotal / imagesToProcess.length).toFixed(2)}ms`);
console.log('⚠️  Main thread was BLOCKED during entire process!\n');

// ============================================
// TEST 2: WORKER THREADS Approach (Parallel)
// ============================================
console.log('🟢 TEST 2: WORKER THREADS Approach (Parallel)');
console.log('='.repeat(50));

const workerStart = Date.now();
const workerResults = [];
let completed = 0;

imagesToProcess.forEach((imageFile, index) => {
  const inputImage = join(imagesDir, imageFile);
  const outputImage = join(imagesDir, `compare-worker-${index}-${Date.now()}.jpg`);
  
  const taskStart = Date.now();
  
  const worker = new Worker(join(__dirname, 'workers', 'image-compression-worker.js'));
  
  worker.postMessage({
    inputImage: inputImage,
    outputImage: outputImage,
    options: {
      width: 800,
      height: 600,
      quality: 70
    }
  });
  
  worker.on('message', (result) => {
    if (result.success) {
      const taskTime = Date.now() - taskStart;
      workerResults.push({
        image: imageFile,
        time: taskTime,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize
      });
      
      console.log(`  ✅ ${imageFile}: ${taskTime}ms`);
      completed++;
      
      if (completed === imagesToProcess.length) {
        const workerTotal = Date.now() - workerStart;
        console.log(`\n⏱️  Total time: ${workerTotal}ms`);
        console.log(`📊 Average per image: ${(workerTotal / imagesToProcess.length).toFixed(2)}ms`);
        console.log('🟢 Main thread was NOT blocked - stayed responsive!\n');
        
        // ============================================
        // COMPARISON RESULTS
        // ============================================
        console.log('📊 COMPARISON RESULTS');
        console.log('='.repeat(50));
        console.log(`Blocking (Sequential):    ${blockingTotal}ms`);
        console.log(`Worker Threads (Parallel): ${workerTotal}ms`);
        console.log(`\n⚡ Speed Improvement: ${((blockingTotal / workerTotal - 1) * 100).toFixed(2)}% faster`);
        console.log(`📈 Efficiency: ${(blockingTotal / workerTotal).toFixed(2)}x better performance\n`);
        
        console.log('💡 Key Takeaways:');
        console.log('   ✅ Worker threads enable true parallelism');
        console.log('   ✅ Main thread stays responsive');
        console.log('   ✅ Better performance for multiple tasks');
        console.log('   ✅ Can utilize multiple CPU cores\n');
      }
    }
    
    worker.terminate();
  });
  
  worker.on('error', (error) => {
    console.error(`  ❌ ${imageFile}: ${error.message}`);
    completed++;
    worker.terminate();
  });
});

console.log('   All workers started in parallel...\n');

