// ============================================
// Example 7: Large File Handling
// ============================================
// Processing very large files efficiently

import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Large File Handling Example ===\n');

// ============================================
// PART 1: Memory Comparison
// ============================================
console.log('--- PART 1: Memory Comparison ---\n');

// Create a large file (10MB)
const largeFile = join(__dirname, 'large-data.txt');
const lines = Array.from({ length: 100000 }, (_, i) => 
  `Line ${i + 1}: This is a large file with lots of data. Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n`
);
fs.writeFileSync(largeFile, lines.join(''));

const fileSize = fs.statSync(largeFile).size;
console.log(`📄 Created large file: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Lines: ${lines.length}\n`);

// Method 1: Without streams (BAD - loads entire file)
console.log('❌ Method 1: Without Streams (BAD)');
const start1 = Date.now();
const allData = fs.readFileSync(largeFile, 'utf8');
const memory1 = process.memoryUsage().heapUsed / 1024 / 1024;
const time1 = Date.now() - start1;
console.log(`   Time: ${time1}ms`);
console.log(`   Memory: ${memory1.toFixed(2)} MB`);
console.log(`   Data length: ${(allData.length / 1024 / 1024).toFixed(2)} MB\n`);

// Method 2: With streams (GOOD - processes in chunks)
console.log('✅ Method 2: With Streams (GOOD)');
const start2 = Date.now();
let chunkCount = 0;
let totalBytes = 0;

const readStream = createReadStream(largeFile, { 
  highWaterMark: 64 * 1024 // 64KB chunks
});

readStream.on('data', (chunk) => {
  chunkCount++;
  totalBytes += chunk.length;
});

readStream.on('end', () => {
  const time2 = Date.now() - start2;
  const memory2 = process.memoryUsage().heapUsed / 1024 / 1024;
  
  console.log(`   Time: ${time2}ms`);
  console.log(`   Memory: ${memory2.toFixed(2)} MB`);
  console.log(`   Chunks processed: ${chunkCount}`);
  console.log(`   Total bytes: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   💡 Memory efficient - only chunks in memory!\n`);
});

// ============================================
// PART 2: Processing Large File
// ============================================
console.log('--- PART 2: Processing Large File ---\n');

const processedFile = join(__dirname, 'processed-large.txt');

class ProcessChunks extends Transform {
  constructor() {
    super();
    this.lineCount = 0;
  }
  
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lines = data.split('\n');
    
    // Process each line
    const processed = lines.map(line => {
      if (line.trim()) {
        this.lineCount++;
        return `[PROCESSED] ${line}`;
      }
      return line;
    }).join('\n');
    
    this.push(processed);
    
    if (this.lineCount % 10000 === 0) {
      process.stdout.write(`\r  ⚙️  Processed ${this.lineCount} lines...`);
    }
    
    callback();
  }
  
  _flush(callback) {
    console.log(`\n  ✅ Total lines processed: ${this.lineCount}`);
    callback();
  }
}

const processor = new ProcessChunks();

(async () => {
  try {
    const start = Date.now();
    
    await pipeline(
      createReadStream(largeFile),
      processor,
      createWriteStream(processedFile)
    );
    
    const time = Date.now() - start;
    const outputSize = fs.statSync(processedFile).size;
    
    console.log(`  ⏱️  Processing time: ${time}ms`);
    console.log(`  📊 Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  💡 Memory efficient - file processed in chunks!\n`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 3: Progress Tracking
// ============================================
console.log('--- PART 3: Progress Tracking ---\n');

const progressFile = join(__dirname, 'progress-output.txt');

class ProgressTracker extends Transform {
  constructor(totalSize) {
    super();
    this.totalSize = totalSize;
    this.processedSize = 0;
  }
  
  _transform(chunk, encoding, callback) {
    this.processedSize += chunk.length;
    const percent = ((this.processedSize / this.totalSize) * 100).toFixed(1);
    
    process.stdout.write(`\r  📊 Progress: ${percent}% (${(this.processedSize / 1024 / 1024).toFixed(2)} MB / ${(this.totalSize / 1024 / 1024).toFixed(2)} MB)`);
    
    this.push(chunk);
    callback();
  }
  
  _flush(callback) {
    console.log('\n  ✅ Processing complete\n');
    callback();
  }
}

const fileStats = fs.statSync(largeFile);
const progressTracker = new ProgressTracker(fileStats.size);

(async () => {
  try {
    await pipeline(
      createReadStream(largeFile),
      progressTracker,
      createWriteStream(progressFile)
    );
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 4: Split Large File
// ============================================
console.log('--- PART 4: Split Large File ---\n');

const chunkSize = 1024 * 1024; // 1MB chunks
let chunkNumber = 0;
let currentChunk = '';
let currentSize = 0;

const splitProcessor = new Transform({
  transform(chunk, encoding, callback) {
    currentChunk += chunk.toString();
    currentSize += chunk.length;
    
    if (currentSize >= chunkSize) {
      const chunkFile = join(__dirname, `chunk-${chunkNumber++}.txt`);
      fs.writeFileSync(chunkFile, currentChunk);
      console.log(`  📄 Created chunk ${chunkNumber}: ${(currentSize / 1024).toFixed(2)} KB`);
      
      currentChunk = '';
      currentSize = 0;
    }
    
    callback();
  },
  
  flush(callback) {
    if (currentChunk) {
      const chunkFile = join(__dirname, `chunk-${chunkNumber++}.txt`);
      fs.writeFileSync(chunkFile, currentChunk);
      console.log(`  📄 Created final chunk ${chunkNumber}: ${(currentSize / 1024).toFixed(2)} KB\n`);
    }
    callback();
  }
});

(async () => {
  try {
    await pipeline(
      createReadStream(largeFile),
      splitProcessor,
      new (class extends Transform {
        _transform(chunk, encoding, callback) {
          callback();
        }
      })()
    );
    
    console.log('  ✅ File split into chunks\n');
    
    // Cleanup chunks
    setTimeout(() => {
      for (let i = 0; i <= chunkNumber; i++) {
        const chunkFile = join(__dirname, `chunk-${i}.txt`);
        if (fs.existsSync(chunkFile)) {
          fs.unlinkSync(chunkFile);
        }
      }
    }, 2000);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// Cleanup after delay
setTimeout(() => {
  [largeFile, processedFile, progressFile].forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}, 5000);

/*
KEY BENEFITS:
1. ✅ Memory efficient - only chunks in memory
2. ✅ Can handle files larger than RAM
3. ✅ Progress tracking possible
4. ✅ Fast processing
5. ✅ Scalable for very large files
*/

