// ============================================
// Example 3: Image Compression - WORKER THREAD Approach
// ============================================
// ✅ This uses worker threads - GOOD approach!

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Image Compression - WORKER THREAD Approach ===\n');
console.log('✅ Using worker threads - main thread stays responsive!\n');

// Check if images directory exists
const imagesDir = join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('📁 Created images directory');
  console.log('💡 Please add some test images (JPEG/PNG) to ./images/ folder\n');
}

// Find first image in images directory
const imageFiles = fs.readdirSync(imagesDir).filter(file => 
  /\.(jpg|jpeg|png|webp)$/i.test(file)
);

if (imageFiles.length === 0) {
  console.log('❌ No images found in ./images/ directory');
  console.log('💡 Please add some test images to continue\n');
  process.exit(1);
}

const inputImage = join(imagesDir, imageFiles[0]);
const outputImage = join(imagesDir, `compressed-worker-${Date.now()}.jpg`);

console.log(`📸 Input image: ${imageFiles[0]}`);
console.log(`💾 Output image: compressed-worker-*.jpg\n`);

// Simulate server handling requests
function simulateRequest(requestNum) {
  console.log(`📨 Request ${requestNum} received`);
}

// Simulate multiple requests coming in
console.log('🖥️  Simulating server requests...\n');
simulateRequest(1);
simulateRequest(2);
simulateRequest(3);

console.log('⏱️  Starting NON-BLOCKING image compression (using worker thread)...');
const start = Date.now();

// Create worker for image compression
const worker = new Worker(join(__dirname, 'workers', 'image-compression-worker.js'));

// Send image compression task to worker
worker.postMessage({
  inputImage: inputImage,
  outputImage: outputImage,
  options: {
    width: 800,
    height: 600,
    quality: 70
  }
});

// Listen for result from worker
worker.on('message', (result) => {
  if (result.success) {
    const compressionTime = Date.now() - start;
    
    console.log(`\n✅ Compression completed in ${compressionTime}ms`);
    console.log(`📊 Original size: ${result.originalSize} KB`);
    console.log(`📊 Compressed size: ${result.compressedSize} KB`);
    console.log(`📊 Compression ratio: ${result.compressionRatio}%`);
    console.log(`\n🟢 Main thread was NOT blocked during compression!`);
    console.log(`🟢 Server could handle other requests simultaneously!\n`);
  } else {
    console.error('❌ Compression failed:', result.error);
  }
  
  worker.terminate();
});

worker.on('error', (error) => {
  console.error('❌ Worker error:', error);
  worker.terminate();
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Worker stopped with exit code ${code}`);
  }
});

// Main thread continues immediately - NOT blocked!
console.log('🟢 Main thread continues (non-blocking!)');
console.log('   Compression happening in worker thread...\n');

// Simulate more requests - these can be handled while compression is happening!
setTimeout(() => {
  console.log('📨 Request 4 received (while compression is happening!)');
  console.log('📨 Request 5 received (while compression is happening!)');
  console.log('   ✅ Server is responsive even during compression!\n');
}, 100);

/*
KEY BENEFITS:
1. Main thread stays responsive
2. Server can handle other requests
3. Better user experience
4. Event loop not frozen
5. True parallelism - uses separate CPU core
*/

