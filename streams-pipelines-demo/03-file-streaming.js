// ============================================
// Example 3: File Streaming
// ============================================
// Real-world file operations with streams

import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== File Streaming Example ===\n');

// ============================================
// PART 1: Reading Large File
// ============================================
console.log('--- PART 1: Reading Large File ---\n');

// Create a large test file (simulated)
const largeFile = join(__dirname, 'large-file.txt');
const lines = Array.from({ length: 10000 }, (_, i) => 
  `This is line number ${i + 1} with some data. Lorem ipsum dolor sit amet.\n`
);
fs.writeFileSync(largeFile, lines.join(''));

const fileSize = fs.statSync(largeFile).size;
console.log(`📄 Created test file: ${(fileSize / 1024).toFixed(2)} KB`);
console.log('📖 Reading file with stream (memory efficient):\n');

let lineCount = 0;
const readStream = createReadStream(largeFile, { encoding: 'utf8' });

readStream.on('data', (chunk) => {
  const lines = chunk.split('\n').filter(line => line.trim());
  lineCount += lines.length;
  process.stdout.write(`\r  📥 Processed ${lineCount} lines...`);
});

readStream.on('end', () => {
  console.log(`\n  ✅ File read complete: ${lineCount} lines processed`);
  console.log('  💡 Memory usage: Minimal (only chunks in memory)\n');
});

readStream.on('error', (error) => {
  console.error('  ❌ Error:', error.message);
});

// ============================================
// PART 2: Writing File with Stream
// ============================================
console.log('--- PART 2: Writing File with Stream ---\n');

const outputFile = join(__dirname, 'output-stream.txt');
const writeStream = createWriteStream(outputFile, { encoding: 'utf8' });

console.log('✍️  Writing data to file with stream:');

for (let i = 0; i < 100; i++) {
  const data = `Data chunk ${i + 1}: ${new Date().toISOString()}\n`;
  writeStream.write(data);
}

writeStream.end();

writeStream.on('finish', () => {
  const outputSize = fs.statSync(outputFile).size;
  console.log(`  ✅ File written: ${(outputSize / 1024).toFixed(2)} KB`);
  console.log(`  📄 Output: ${outputFile}\n`);
});

writeStream.on('error', (error) => {
  console.error('  ❌ Error:', error.message);
});

// ============================================
// PART 3: File Copy with Pipeline
// ============================================
console.log('--- PART 3: File Copy with Pipeline ---\n');

const sourceFile = join(__dirname, 'source-copy.txt');
const destFile = join(__dirname, 'dest-copy.txt');

// Create source file
const sourceData = 'This is source file content.\n'.repeat(1000);
fs.writeFileSync(sourceFile, sourceData);

console.log('📋 Copying file using pipeline:');
console.log(`  Source: ${sourceFile}`);
console.log(`  Destination: ${destFile}\n`);

(async () => {
  try {
    const start = Date.now();
    
    await pipeline(
      createReadStream(sourceFile),
      createWriteStream(destFile)
    );
    
    const time = Date.now() - start;
    const sourceSize = fs.statSync(sourceFile).size;
    const destSize = fs.statSync(destFile).size;
    
    console.log(`  ✅ Copy completed in ${time}ms`);
    console.log(`  📊 Source: ${(sourceSize / 1024).toFixed(2)} KB`);
    console.log(`  📊 Destination: ${(destSize / 1024).toFixed(2)} KB`);
    console.log('  💡 Memory efficient - no full file in memory!\n');
    
    // Cleanup
    fs.unlinkSync(sourceFile);
    fs.unlinkSync(destFile);
  } catch (error) {
    console.error('  ❌ Copy error:', error.message);
  }
})();

// ============================================
// PART 4: Processing File Line by Line
// ============================================
console.log('--- PART 4: Processing File Line by Line ---\n');

const logFile = join(__dirname, 'app.log');
const processedFile = join(__dirname, 'processed.log');

// Create log file
const logEntries = [
  '2024-01-01 INFO: Application started',
  '2024-01-01 ERROR: Connection failed',
  '2024-01-01 INFO: Retrying connection',
  '2024-01-01 WARN: High memory usage',
  '2024-01-01 INFO: Connection established',
  '2024-01-01 ERROR: Database timeout',
  '2024-01-01 INFO: Request completed'
].join('\n') + '\n';
fs.writeFileSync(logFile, logEntries);

console.log('📝 Processing log file line by line:');

import { Transform } from 'stream';

const processLogs = new Transform({
  objectMode: false,
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n').filter(line => line.trim());
    const processed = lines.map(line => {
      if (line.includes('ERROR')) {
        return `[CRITICAL] ${line}`;
      } else if (line.includes('WARN')) {
        return `[WARNING] ${line}`;
      }
      return line;
    }).join('\n') + '\n';
    
    this.push(processed);
    callback();
  }
});

(async () => {
  try {
    await pipeline(
      createReadStream(logFile),
      processLogs,
      createWriteStream(processedFile)
    );
    
    console.log('  ✅ Log processing complete');
    console.log('  📄 Processed file created\n');
    
    // Show processed content
    const processed = fs.readFileSync(processedFile, 'utf8');
    console.log('  Processed logs:');
    process.stdout.write(processed);
    
    // Cleanup
    fs.unlinkSync(logFile);
    fs.unlinkSync(processedFile);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// Cleanup large file after a delay
setTimeout(() => {
  if (fs.existsSync(largeFile)) {
    fs.unlinkSync(largeFile);
  }
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
}, 2000);

/*
REAL-WORLD USE CASES:
1. ✅ Large file processing (logs, data files)
2. ✅ File copying/moving
3. ✅ Data transformation
4. ✅ Log processing
5. ✅ Memory-efficient file operations
*/

