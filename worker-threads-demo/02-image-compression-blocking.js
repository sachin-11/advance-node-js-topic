// ============================================
// Example 2: Image Compression - BLOCKING Approach
// ============================================
// ⚠️ This blocks the main thread - BAD approach!

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Image Compression - BLOCKING Approach ===\n');
console.log('⚠️  WARNING: This will block the main thread!\n');

// Check if images directory exists, if not create it
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
const outputImage = join(imagesDir, `compressed-blocking-${Date.now()}.jpg`);

console.log(`📸 Input image: ${imageFiles[0]}`);
console.log(`💾 Output image: compressed-blocking-*.jpg\n`);

// Simulate server handling requests
function simulateRequest(requestNum) {
  console.log(`📨 Request ${requestNum} received`);
}

// Simulate multiple requests coming in
console.log('🖥️  Simulating server requests...\n');
simulateRequest(1);
simulateRequest(2);
simulateRequest(3);

console.log('⏱️  Starting BLOCKING image compression...');
const start = Date.now();

// BLOCKING: This will block the main thread!
try {
  await sharp(inputImage)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 70 })
    .toFile(outputImage);
  
  const compressionTime = Date.now() - start;
  
  // Get file sizes
  const inputStats = fs.statSync(inputImage);
  const outputStats = fs.statSync(outputImage);
  const inputSize = (inputStats.size / 1024).toFixed(2);
  const outputSize = (outputStats.size / 1024).toFixed(2);
  const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(2);
  
  console.log(`\n✅ Compression completed in ${compressionTime}ms`);
  console.log(`📊 Original size: ${inputSize} KB`);
  console.log(`📊 Compressed size: ${outputSize} KB`);
  console.log(`📊 Compression ratio: ${compressionRatio}%`);
  console.log(`\n⚠️  During compression, main thread was BLOCKED!`);
  console.log(`⚠️  Server couldn't handle other requests during this time!\n`);
  
} catch (error) {
  console.error('❌ Error compressing image:', error.message);
}

console.log('📨 Request 4 received (only after compression completed)');
console.log('📨 Request 5 received (only after compression completed)');

/*
KEY PROBLEMS:
1. Main thread blocked during compression
2. Server can't handle other requests
3. Poor user experience
4. Event loop frozen

SOLUTION: Use Worker Threads! (See 03-image-compression-worker.js)
*/

