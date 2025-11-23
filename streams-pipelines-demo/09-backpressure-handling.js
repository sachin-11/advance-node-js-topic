// ============================================
// Example 9: Backpressure Handling
// ============================================
// Understanding and handling backpressure in streams

import { Readable, Writable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

console.log('=== Backpressure Handling Example ===\n');

// ============================================
// PART 1: Understanding Backpressure
// ============================================
console.log('--- PART 1: Understanding Backpressure ---\n');

console.log('💡 Backpressure occurs when:');
console.log('   • Producer (Readable) is faster than Consumer (Writable)');
console.log('   • Consumer cannot keep up with data flow');
console.log('   • Streams automatically handle this with pause/resume\n');

// ============================================
// PART 2: Fast Producer, Slow Consumer
// ============================================
console.log('--- PART 2: Fast Producer, Slow Consumer ---\n');

const fastProducer = new Readable({
  read() {
    // Produce data quickly
    for (let i = 0; i < 100; i++) {
      if (!this.push(`Data chunk ${i}\n`)) {
        // push() returns false when buffer is full (backpressure)
        console.log('  ⚠️  Backpressure: Buffer full, pausing...');
        break;
      }
    }
  }
});

const slowConsumer = new Writable({
  write(chunk, encoding, callback) {
    // Simulate slow processing (100ms delay)
    setTimeout(() => {
      process.stdout.write(`  📥 Consumed: ${chunk.toString().trim()}\n`);
      callback();
    }, 100);
  }
});

console.log('  🚀 Starting fast producer → slow consumer...\n');

fastProducer.pipe(slowConsumer);

slowConsumer.on('finish', () => {
  console.log('\n  ✅ Stream completed');
  console.log('  💡 Backpressure automatically handled by streams\n');
});

// ============================================
// PART 3: Manual Backpressure Control
// ============================================
console.log('--- PART 3: Manual Backpressure Control ---\n');

const manualProducer = new Readable({
  read() {
    // Produce data
    const data = `Chunk ${this.count || 0}\n`;
    this.count = (this.count || 0) + 1;
    
    if (!this.push(data)) {
      console.log('  ⏸️  Producer paused (backpressure)');
    }
    
    if (this.count >= 10) {
      this.push(null); // End stream
    }
  }
});

const manualConsumer = new Writable({
  write(chunk, encoding, callback) {
    console.log(`  📥 Processing: ${chunk.toString().trim()}`);
    
    // Simulate processing time
    setTimeout(() => {
      callback();
      
      // Resume producer if it was paused
      if (manualProducer.isPaused()) {
        console.log('  ▶️  Resuming producer');
        manualProducer.resume();
      }
    }, 200);
  }
});

// Handle drain event (buffer emptied)
manualConsumer.on('drain', () => {
  console.log('  💧 Consumer drained, ready for more');
  if (manualProducer.isPaused()) {
    manualProducer.resume();
  }
});

console.log('  🚀 Manual backpressure control...\n');

manualProducer.pipe(manualConsumer);

manualConsumer.on('finish', () => {
  console.log('\n  ✅ Manual control complete\n');
});

// ============================================
// PART 4: High Water Mark
// ============================================
console.log('--- PART 4: High Water Mark (Buffer Size) ---\n');

const highWaterMarkProducer = new Readable({
  highWaterMark: 16, // Small buffer (16 bytes)
  read() {
    const data = 'A'.repeat(10) + '\n'; // 11 bytes per chunk
    this.push(data);
    
    if ((this.count || 0) >= 20) {
      this.push(null);
    }
    this.count = (this.count || 0) + 1;
  }
});

const highWaterMarkConsumer = new Writable({
  highWaterMark: 16, // Small buffer
  write(chunk, encoding, callback) {
    console.log(`  📥 Consumed ${chunk.length} bytes`);
    setTimeout(callback, 50);
  }
});

console.log('  📊 Buffer size: 16 bytes');
console.log('  🚀 Testing with small buffer...\n');

highWaterMarkProducer.pipe(highWaterMarkConsumer);

highWaterMarkConsumer.on('finish', () => {
  console.log('\n  ✅ High water mark test complete\n');
});

// ============================================
// PART 5: Backpressure in Pipeline
// ============================================
console.log('--- PART 5: Backpressure in Pipeline ---\n');

const pipelineProducer = new Readable({
  read() {
    const data = `Pipeline data ${this.count || 0}\n`;
    this.count = (this.count || 0) + 1;
    
    if (!this.push(data)) {
      console.log('  ⏸️  Pipeline paused');
    }
    
    if ((this.count || 0) >= 15) {
      this.push(null);
    }
  }
});

const transform1 = new Transform({
  transform(chunk, encoding, callback) {
    // Fast transform
    this.push(`[T1] ${chunk.toString()}`);
    callback();
  }
});

const transform2 = new Transform({
  transform(chunk, encoding, callback) {
    // Slow transform (simulates processing)
    setTimeout(() => {
      this.push(`[T2] ${chunk.toString()}`);
      callback();
    }, 100);
  }
});

const pipelineConsumer = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 Final: ${chunk.toString()}`);
    setTimeout(callback, 50);
  }
});

console.log('  🚀 Pipeline with backpressure...\n');

(async () => {
  try {
    await pipeline(
      pipelineProducer,
      transform1,
      transform2,
      pipelineConsumer
    );
    console.log('\n  ✅ Pipeline complete');
    console.log('  💡 pipeline() automatically handles backpressure\n');
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 6: Best Practices
// ============================================
console.log('--- PART 6: Best Practices ---\n');

setTimeout(() => {
  console.log('📚 BACKPRESSURE BEST PRACTICES:\n');
  console.log('1. ✅ Use pipeline() - automatic backpressure handling');
  console.log('2. ✅ Don\'t ignore backpressure signals');
  console.log('3. ✅ Use appropriate highWaterMark values');
  console.log('4. ✅ Handle drain events for manual control');
  console.log('5. ✅ Monitor stream state (isPaused, readableFlowing)');
  console.log('6. ✅ Let streams handle backpressure automatically\n');
  
  console.log('⚠️  COMMON MISTAKES:\n');
  console.log('1. ❌ Ignoring backpressure (can cause memory issues)');
  console.log('2. ❌ Not handling drain events');
  console.log('3. ❌ Setting highWaterMark too high');
  console.log('4. ❌ Manual pause/resume without checking state\n');
}, 3000);

/*
KEY CONCEPTS:
1. Backpressure = Producer faster than Consumer
2. Streams automatically pause/resume
3. push() returns false when buffer full
4. drain event signals buffer emptied
5. pipeline() handles backpressure automatically
6. highWaterMark controls buffer size
*/

