// ============================================
// Image Compression Worker Thread
// ============================================

import { parentPort } from 'worker_threads';
import sharp from 'sharp';
import fs from 'fs';

// Check if running as a worker thread
if (!parentPort) {
  console.error('❌ This file must be run as a worker thread, not directly!');
  process.exit(1);
}

// Listen for messages from main thread
parentPort.on('message', async (data) => {
  const { inputImage, outputImage, options } = data;
  
  try {
    console.log('⚙️  Worker: Starting image compression...');
    
    // Compress image using sharp
    await sharp(inputImage)
      .resize(options.width, options.height, { fit: 'inside' })
      .jpeg({ quality: options.quality })
      .toFile(outputImage);
    
    // Get file sizes
    const inputStats = fs.statSync(inputImage);
    const outputStats = fs.statSync(outputImage);
    const inputSize = (inputStats.size / 1024).toFixed(2);
    const outputSize = (outputStats.size / 1024).toFixed(2);
    const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(2);
    
    console.log('✅ Worker: Compression complete');
    
    // Send result back to main thread
    parentPort.postMessage({
      success: true,
      originalSize: inputSize,
      compressedSize: outputSize,
      compressionRatio: compressionRatio,
      outputPath: outputImage
    });
    
  } catch (error) {
    console.error('❌ Worker: Compression error:', error.message);
    
    // Send error back to main thread
    parentPort.postMessage({
      success: false,
      error: error.message
    });
  }
});

