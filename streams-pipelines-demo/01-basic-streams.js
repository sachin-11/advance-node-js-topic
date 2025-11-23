// ============================================
// Example 1: Basic Streams
// ============================================
// Understanding Readable, Writable, and Transform streams

import { Readable, Writable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

console.log('=== Basic Streams Example ===\n');

// ============================================
// PART 1: Readable Stream
// ============================================
console.log('--- PART 1: Readable Stream ---\n');

const readable = new Readable({
  read() {
    // This function is called when stream needs data
  }
});

// Push data to stream
readable.push('Hello ');
readable.push('World ');
readable.push('from ');
readable.push('Streams!\n');
readable.push(null); // Signal end of stream

console.log('Readable stream created');
console.log('Data chunks:');

readable.on('data', (chunk) => {
  process.stdout.write(`  📥 Received: ${chunk.toString()}`);
});

readable.on('end', () => {
  console.log('  ✅ Stream ended\n');
});

// ============================================
// PART 2: Writable Stream
// ============================================
console.log('--- PART 2: Writable Stream ---\n');

const writable = new Writable({
  write(chunk, encoding, callback) {
    console.log(`  ✍️  Writing: ${chunk.toString().trim()}`);
    callback(); // Signal that write is complete
  }
});

writable.write('Chunk 1\n');
writable.write('Chunk 2\n');
writable.write('Chunk 3\n');
writable.end('Final chunk\n');

writable.on('finish', () => {
  console.log('  ✅ All data written\n');
});

// ============================================
// PART 3: Transform Stream
// ============================================
console.log('--- PART 3: Transform Stream ---\n');

const transform = new Transform({
  transform(chunk, encoding, callback) {
    // Transform data: convert to uppercase
    const transformed = chunk.toString().toUpperCase();
    this.push(transformed);
    callback();
  }
});

console.log('Transform stream (converting to uppercase):');

transform.on('data', (chunk) => {
  console.log(`  🔄 Transformed: ${chunk.toString().trim()}`);
});

transform.write('hello world\n');
transform.write('streams are awesome\n');
transform.end('end of stream\n');

transform.on('end', () => {
  console.log('  ✅ Transformation complete\n');
});

// ============================================
// PART 4: Chaining Streams
// ============================================
console.log('--- PART 4: Chaining Streams ---\n');

const source = new Readable({
  read() {}
});

const uppercaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

const addPrefixTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`[PREFIX] ${chunk.toString()}`);
    callback();
  }
});

const destination = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 Output: ${chunk.toString()}`);
    callback();
  }
});

console.log('Chaining: Readable → Transform → Transform → Writable');

// Push data to source
source.push('first line\n');
source.push('second line\n');
source.push('third line\n');
source.push(null);

// Chain streams
source
  .pipe(uppercaseTransform)
  .pipe(addPrefixTransform)
  .pipe(destination)
  .on('finish', () => {
    console.log('\n  ✅ Pipeline complete\n');
  });

// ============================================
// PART 5: Using pipeline() (Recommended)
// ============================================
console.log('--- PART 5: Using pipeline() (Recommended) ---\n');

const source2 = new Readable({
  read() {}
});

const transform1 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`[STEP1] ${chunk.toString()}`);
    callback();
  }
});

const transform2 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`[STEP2] ${chunk.toString()}`);
    callback();
  }
});

const destination2 = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 Final: ${chunk.toString()}`);
    callback();
  }
});

source2.push('data line 1\n');
source2.push('data line 2\n');
source2.push(null);

// pipeline() automatically handles errors and cleanup
(async () => {
  try {
    await pipeline(
      source2,
      transform1,
      transform2,
      destination2
    );
    console.log('\n  ✅ Pipeline completed successfully\n');
  } catch (error) {
    console.error('  ❌ Pipeline error:', error.message);
  }
})();

/*
KEY CONCEPTS:
1. Readable: Produces data (readable.push())
2. Writable: Consumes data (writable.write())
3. Transform: Reads, transforms, writes
4. pipe(): Chains streams (old way)
5. pipeline(): Better error handling (recommended)
*/

