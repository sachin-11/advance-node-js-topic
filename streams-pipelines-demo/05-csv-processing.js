// ============================================
// Example 5: CSV Processing
// ============================================
// Processing large CSV files with streams

import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== CSV Processing Example ===\n');

// ============================================
// PART 1: Generate Test CSV
// ============================================
console.log('--- PART 1: Generate Test CSV ---\n');

const csvFile = join(__dirname, 'data.csv');
const outputCsv = join(__dirname, 'processed-data.csv');

// Generate large CSV file
const headers = ['id', 'name', 'email', 'age', 'city', 'salary'];
const rows = [];

for (let i = 1; i <= 1000; i++) {
  rows.push([
    i,
    `User ${i}`,
    `user${i}@example.com`,
    20 + (i % 50),
    `City ${(i % 10) + 1}`,
    30000 + (i * 100)
  ]);
}

// Write CSV
const csvContent = [
  headers.join(','),
  ...rows.map(row => row.join(','))
].join('\n') + '\n';

fs.writeFileSync(csvFile, csvContent);
console.log(`📄 Created CSV file: ${(fs.statSync(csvFile).size / 1024).toFixed(2)} KB`);
console.log(`   Rows: ${rows.length}\n`);

// ============================================
// PART 2: Parse CSV with Streams
// ============================================
console.log('--- PART 2: Parse CSV with Streams ---\n');

let rowCount = 0;
let totalSalary = 0;

const csvParser = parse({
  columns: true,
  skip_empty_lines: true
});

const processRows = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    rowCount++;
    totalSalary += parseInt(chunk.salary || 0);
    
    // Process every 100 rows
    if (rowCount % 100 === 0) {
      process.stdout.write(`\r  📊 Processed ${rowCount} rows...`);
    }
    
    callback();
  }
});

const csvDest = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    callback();
  }
});

(async () => {
  try {
    await pipeline(
      createReadStream(csvFile),
      csvParser,
      processRows,
      csvDest
    );
    
    console.log(`\n  ✅ CSV processing complete`);
    console.log(`  📊 Total rows: ${rowCount}`);
    console.log(`  💰 Total salary: $${totalSalary.toLocaleString()}`);
    console.log(`  📈 Average salary: $${(totalSalary / rowCount).toFixed(2)}\n`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 3: Transform CSV Data
// ============================================
console.log('--- PART 3: Transform CSV Data ---\n');

const transformCsv = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    // Add bonus to salary
    const salary = parseInt(chunk.salary);
    const bonus = salary * 0.1;
    const newSalary = salary + bonus;
    
    const transformed = {
      ...chunk,
      salary: newSalary.toFixed(2),
      bonus: bonus.toFixed(2),
      processed_at: new Date().toISOString()
    };
    
    this.push(transformed);
    callback();
  }
});

const csvStringifier = stringify({
  header: true,
  columns: ['id', 'name', 'email', 'age', 'city', 'salary', 'bonus', 'processed_at']
});

(async () => {
  try {
    await pipeline(
      createReadStream(csvFile),
      csvParser,
      transformCsv,
      csvStringifier,
      createWriteStream(outputCsv)
    );
    
    console.log('  ✅ CSV transformation complete');
    console.log(`  📄 Output file: ${outputCsv}`);
    console.log(`  📊 Size: ${(fs.statSync(outputCsv).size / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 4: Filter CSV Rows
// ============================================
console.log('--- PART 4: Filter CSV Rows ---\n');

const filteredCsv = join(__dirname, 'filtered-data.csv');

const filterRows = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    // Filter: age > 40 and salary > 50000
    const age = parseInt(chunk.age);
    const salary = parseInt(chunk.salary);
    
    if (age > 40 && salary > 50000) {
      this.push(chunk);
    }
    
    callback();
  }
});

const filterStringifier = stringify({
  header: true
});

(async () => {
  try {
    let filteredCount = 0;
    
    const countFilter = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        filteredCount++;
        this.push(chunk);
        callback();
      }
    });
    
    await pipeline(
      createReadStream(csvFile),
      csvParser,
      filterRows,
      countFilter,
      filterStringifier,
      createWriteStream(filteredCsv)
    );
    
    console.log('  ✅ CSV filtering complete');
    console.log(`  📊 Filtered rows: ${filteredCount}`);
    console.log(`  📄 Output: ${filteredCsv}\n`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// Cleanup after delay
setTimeout(() => {
  [csvFile, outputCsv, filteredCsv].forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}, 3000);

/*
REAL-WORLD USE CASES:
1. ✅ Processing large CSV files
2. ✅ Data transformation
3. ✅ Filtering data
4. ✅ Generating reports
5. ✅ Memory-efficient CSV operations
*/

