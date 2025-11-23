// ============================================
// Example 8: Log Processing
// ============================================
// Real-time log file processing with streams

import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Log Processing Example ===\n');

// ============================================
// PART 1: Generate Log File
// ============================================
console.log('--- PART 1: Generate Log File ---\n');

const logFile = join(__dirname, 'app.log');
const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const messages = [
  'Application started',
  'User logged in',
  'Database connection established',
  'Request received',
  'Processing data',
  'Connection failed',
  'Retrying connection',
  'Request completed',
  'High memory usage detected',
  'Cache cleared',
  'Database timeout',
  'File uploaded',
  'Email sent',
  'Payment processed'
];

const logEntries = [];
for (let i = 0; i < 1000; i++) {
  const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
  const level = logLevels[Math.floor(Math.random() * logLevels.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];
  logEntries.push(`${timestamp} [${level}] ${message}\n`);
}

fs.writeFileSync(logFile, logEntries.join(''));
console.log(`📄 Created log file: ${(fs.statSync(logFile).size / 1024).toFixed(2)} KB`);
console.log(`   Entries: ${logEntries.length}\n`);

// ============================================
// PART 2: Filter Error Logs
// ============================================
console.log('--- PART 2: Filter Error Logs ---\n');

const errorLogFile = join(__dirname, 'errors.log');

class ErrorFilter extends Transform {
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lines = data.split('\n').filter(line => line.trim());
    
    const errorLines = lines.filter(line => line.includes('[ERROR]'));
    
    if (errorLines.length > 0) {
      this.push(errorLines.join('\n') + '\n');
    }
    
    callback();
  }
}

let errorCount = 0;
const errorCounter = new Transform({
  _transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n').filter(line => line.trim());
    errorCount += lines.length;
    this.push(chunk);
    callback();
  }
});

(async () => {
  try {
    await pipeline(
      createReadStream(logFile),
      new ErrorFilter(),
      errorCounter,
      createWriteStream(errorLogFile)
    );
    
    console.log(`  ✅ Error logs extracted: ${errorCount} errors`);
    console.log(`  📄 Saved to: ${errorLogFile}\n`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
})();

// ============================================
// PART 3: Parse and Analyze Logs
// ============================================
console.log('--- PART 3: Parse and Analyze Logs ---\n');

class LogParser extends Transform {
  constructor() {
    super({ objectMode: true });
    this.stats = {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      DEBUG: 0
    };
  }
  
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lines = data.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/\[(\w+)\]/);
      if (match) {
        const level = match[1];
        if (this.stats[level] !== undefined) {
          this.stats[level]++;
        }
      }
      
      this.push({
        raw: line,
        parsed: this.parseLogLine(line)
      });
    });
    
    callback();
  }
  
  parseLogLine(line) {
    const match = line.match(/(\d{4}-\d{2}-\d{2}T[\d:.-]+)\s+\[(\w+)\]\s+(.+)/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3]
      };
    }
    return null;
  }
  
  _flush(callback) {
    console.log('  📊 Log Statistics:');
    console.log(`     INFO: ${this.stats.INFO}`);
    console.log(`     WARN: ${this.stats.WARN}`);
    console.log(`     ERROR: ${this.stats.ERROR}`);
    console.log(`     DEBUG: ${this.stats.DEBUG}\n`);
    callback();
  }
}

const logParser = new LogParser();
const logDest = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    callback();
  }
});

(async () => {
  await pipeline(
    createReadStream(logFile),
    logParser,
    logDest
  );
})();

// ============================================
// PART 4: Real-time Log Monitoring
// ============================================
console.log('--- PART 4: Real-time Log Monitoring ---\n');

class LogMonitor extends Transform {
  constructor() {
    super();
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    
    // Keep incomplete line in buffer
    this.buffer = lines.pop() || '';
    
    lines.forEach(line => {
      if (line.trim()) {
        this.processLine(line);
      }
    });
    
    callback();
  }
  
  processLine(line) {
    if (line.includes('[ERROR]')) {
      console.log(`  🚨 ERROR: ${line}`);
    } else if (line.includes('[WARN]')) {
      console.log(`  ⚠️  WARN: ${line}`);
    }
  }
}

console.log('  👀 Monitoring logs in real-time...\n');

const monitor = new LogMonitor();
const monitorDest = new Writable({
  write(chunk, encoding, callback) {
    callback();
  }
});

(async () => {
  await pipeline(
    createReadStream(logFile),
    monitor,
    monitorDest
  );
  
  console.log('\n  ✅ Monitoring complete\n');
})();

// ============================================
// PART 5: Log Aggregation
// ============================================
console.log('--- PART 5: Log Aggregation ---\n');

const summaryFile = join(__dirname, 'log-summary.json');

class LogAggregator extends Transform {
  constructor() {
    super({ objectMode: true });
    this.summary = {
      total: 0,
      byLevel: {},
      byHour: {},
      errors: []
    };
  }
  
  _transform(chunk, encoding, callback) {
    const parsed = chunk.parsed;
    if (parsed) {
      this.summary.total++;
      
      // Count by level
      this.summary.byLevel[parsed.level] = 
        (this.summary.byLevel[parsed.level] || 0) + 1;
      
      // Count by hour
      const hour = new Date(parsed.timestamp).getHours();
      this.summary.byHour[hour] = 
        (this.summary.byHour[hour] || 0) + 1;
      
      // Collect errors
      if (parsed.level === 'ERROR') {
        this.summary.errors.push({
          timestamp: parsed.timestamp,
          message: parsed.message
        });
      }
    }
    
    this.push(chunk);
    callback();
  }
  
  _flush(callback) {
    fs.writeFileSync(summaryFile, JSON.stringify(this.summary, null, 2));
    console.log('  ✅ Log summary created');
    console.log(`  📄 Summary: ${summaryFile}\n`);
    callback();
  }
}

const aggregator = new LogAggregator();
const aggDest = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    callback();
  }
});

(async () => {
  await pipeline(
    createReadStream(logFile),
    logParser,
    aggregator,
    aggDest
  );
})();

// Cleanup after delay
setTimeout(() => {
  [logFile, errorLogFile, summaryFile].forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}, 3000);

/*
REAL-WORLD USE CASES:
1. ✅ Log file analysis
2. ✅ Error tracking
3. ✅ Real-time log monitoring
4. ✅ Log aggregation
5. ✅ Performance metrics
*/

