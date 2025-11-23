// ============================================
// Example 4: Multiple Workers - Parallel Processing
// ============================================
// Processing multiple images in parallel using multiple workers

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Multiple Workers - Parallel Processing ===\n');

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

// Use first 3 images (or all if less than 3)
const imagesToProcess = imageFiles.slice(0, Math.min(3, imageFiles.length));

console.log(`📸 Processing ${imagesToProcess.length} images in parallel...\n`);

const start = Date.now();
const workers = [];
const results = [];

// Create a worker for each image
imagesToProcess.forEach((imageFile, index) => {
  const inputImage = join(imagesDir, imageFile);
  const outputImage = join(imagesDir, `compressed-parallel-${index}-${Date.now()}.jpg`);
  
  console.log(`🔄 Creating worker ${index + 1} for: ${imageFile}`);
  
  // Create worker
  const worker = new Worker(join(__dirname, 'workers', 'image-compression-worker.js'));
  
  // Send compression task
  worker.postMessage({
    inputImage: inputImage,
    outputImage: outputImage,
    options: {
      width: 800,
      height: 600,
      quality: 70
    }
  });
  
  // Listen for result
  worker.on('message', (result) => {
    if (result.success) {
      results.push({
        image: imageFile,
        ...result
      });
      console.log(`✅ Worker ${index + 1} completed: ${imageFile}`);
      console.log(`   Compressed: ${result.originalSize} KB → ${result.compressedSize} KB\n`);
    } else {
      console.error(`❌ Worker ${index + 1} failed: ${result.error}`);
    }
    
    worker.terminate();
    
    // Check if all workers are done
    if (results.length === imagesToProcess.length) {
      const totalTime = Date.now() - start;
      console.log('='.repeat(50));
      console.log(`🎉 All images processed in ${totalTime}ms`);
      console.log(`📊 Total images: ${results.length}`);
      console.log(`⚡ Average time per image: ${(totalTime / results.length).toFixed(2)}ms`);
      console.log('='.repeat(50));
      console.log('\n💡 Note: All images processed in PARALLEL!');
      console.log('   If done sequentially, it would take much longer!\n');
    }
  });
  
  worker.on('error', (error) => {
    console.error(`❌ Worker ${index + 1} error:`, error);
    worker.terminate();
  });
  
  workers.push(worker);
});

console.log(`\n🟢 All ${workers.length} workers started in parallel!`);
console.log('   Main thread continues (non-blocking)...\n');

/*
KEY BENEFITS:
1. Multiple images processed simultaneously
2. Uses multiple CPU cores
3. Much faster than sequential processing
4. Main thread stays responsive
*/

