// ============================================
// Example 2: Pipelines
// ============================================
// Using pipeline() for better error handling and cleanup

import { Readable, Writable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Pipelines Example ===\n');

// ============================================
// PART 1: Basic Pipeline
// ============================================
console.log('--- PART 1: Basic Pipeline ---\n');

const source = new Readable({
  read() {}
});

const transform = new Transform({
  transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const transformed = `[${new Date().toISOString()}] ${data}`;
    this.push(transformed);
    callback();
  }
});

const destination = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 ${chunk.toString()}`);
    callback();
  }
});

source.push('Message 1\n');
source.push('Message 2\n');
source.push('Message 3\n');
source.push(null);

(async () => {
  try {
    await pipeline(source, transform, destination);
    console.log('  ✅ Pipeline completed\n');
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 2: File Pipeline
// ============================================
console.log('--- PART 2: File Pipeline ---\n');

// Create test file
const testFile = join(__dirname, 'test-input.txt');
const outputFile = join(__dirname, 'test-output.txt');

import fs from 'fs';

// Create test data
const testData = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n';
fs.writeFileSync(testFile, testData);

console.log('Processing file through pipeline:');
console.log(`  Input: ${testFile}`);
console.log(`  Output: ${outputFile}\n`);

const uppercaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

const addLineNumbers = new Transform({
  lineNumber: 1,
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n').filter(line => line);
    const numbered = lines.map(line => 
      `${this.lineNumber++}. ${line}\n`
    ).join('');
    this.push(numbered);
    callback();
  }
});

(async () => {
  try {
    await pipeline(
      createReadStream(testFile),
      uppercaseTransform,
      addLineNumbers,
      createWriteStream(outputFile)
    );
    
    console.log('  ✅ File processed successfully');
    console.log('  📄 Output file created\n');
    
    // Show output
    const output = fs.readFileSync(outputFile, 'utf8');
    console.log('  Output content:');
    process.stdout.write(output);
    console.log('');
    
    // Cleanup
    fs.unlinkSync(testFile);
    fs.unlinkSync(outputFile);
  } catch (error) {
    console.error('  ❌ Pipeline error:', error.message);
  }
})();

// ============================================
// PART 3: Error Handling in Pipeline
// ============================================
console.log('--- PART 3: Error Handling ---\n');

const errorSource = new Readable({
  read() {}
});

const errorTransform = new Transform({
  transform(chunk, encoding, callback) {
    // Simulate error on specific data
    if (chunk.toString().includes('ERROR')) {
      callback(new Error('Transform error occurred!'));
    } else {
      this.push(chunk);
      callback();
    }
  }
});

const errorDestination = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  ✅ Processed: ${chunk.toString()}`);
    callback();
  }
});

errorSource.push('Normal data 1\n');
errorSource.push('ERROR data\n');
errorSource.push('Normal data 2\n');
errorSource.push(null);

(async () => {
  try {
    await pipeline(errorSource, errorTransform, errorDestination);
    console.log('  ✅ All processed\n');
  } catch (error) {
    console.log(`  ❌ Pipeline stopped: ${error.message}`);
    console.log('  💡 pipeline() automatically cleans up streams on error\n');
  }
})();

// ============================================
// PART 4: Multiple Transform Steps
// ============================================
console.log('--- PART 4: Complex Pipeline ---\n');

const complexSource = new Readable({
  read() {}
});

// Step 1: Add timestamp
const step1 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`[${Date.now()}] ${chunk.toString()}`);
    callback();
  }
});

// Step 2: Add prefix
const step2 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`[PREFIX] ${chunk.toString()}`);
    callback();
  }
});

// Step 3: Uppercase
const step3 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Step 4: Add suffix
const step4 = new Transform({
  transform(chunk, encoding, callback) {
    this.push(`${chunk.toString().trim()} [SUFFIX]\n`);
    callback();
  }
});

const complexDestination = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 ${chunk.toString()}`);
    callback();
  }
});

complexSource.push('hello world\n');
complexSource.push('streams pipeline\n');
complexSource.push(null);

(async () => {
  try {
    await pipeline(
      complexSource,
      step1,
      step2,
      step3,
      step4,
      complexDestination
    );
    console.log('  ✅ Complex pipeline completed\n');
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

/*
KEY BENEFITS OF pipeline():
1. ✅ Automatic error handling
2. ✅ Automatic stream cleanup
3. ✅ Proper backpressure handling
4. ✅ Cleaner code
5. ✅ Promise-based (async/await support)
*/

