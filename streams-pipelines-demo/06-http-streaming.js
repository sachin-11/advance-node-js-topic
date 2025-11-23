// ============================================
// Example 6: HTTP Streaming
// ============================================
// Streaming HTTP requests and responses

import http from 'http';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== HTTP Streaming Example ===\n');

// ============================================
// PART 1: Streaming HTTP Response
// ============================================
console.log('--- PART 1: Streaming HTTP Response ---\n');

// Create test file
const testFile = join(__dirname, 'http-test.txt');
const testData = Array.from({ length: 100 }, (_, i) => 
  `Line ${i + 1}: This is streaming data from server.\n`
).join('');
fs.writeFileSync(testFile, testData);

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    console.log('  📡 Client requested streaming data');
    
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    });
    
    // Stream file to response
    const fileStream = createReadStream(testFile);
    
    fileStream.on('data', (chunk) => {
      res.write(chunk);
      process.stdout.write('.');
    });
    
    fileStream.on('end', () => {
      res.end();
      console.log('\n  ✅ Streaming complete\n');
    });
    
    fileStream.on('error', (error) => {
      res.statusCode = 500;
      res.end('Error: ' + error.message);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('  🚀 Server running on http://localhost:3000');
  console.log('  📡 Test endpoint: http://localhost:3000/stream\n');
  
  // Make test request
  setTimeout(() => {
    console.log('  📥 Making test request...\n');
    
    http.get('http://localhost:3000/stream', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write('📥');
      });
      
      res.on('end', () => {
        console.log(`\n  ✅ Received ${data.length} bytes`);
        console.log('  💡 Data streamed in chunks (memory efficient)\n');
        
        // Cleanup
        server.close();
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      });
    });
  }, 500);
});

// ============================================
// PART 2: Download File with Streams
// ============================================
console.log('--- PART 2: Download File with Streams ---\n');

const downloadUrl = 'http://localhost:3001/download';
const downloadFile = join(__dirname, 'downloaded-file.txt');

// Create download server
const downloadServer = http.createServer((req, res) => {
  if (req.url === '/download') {
    const fileStream = createReadStream(testFile);
    
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="test.txt"'
    });
    
    fileStream.pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

downloadServer.listen(3001, () => {
  console.log('  🚀 Download server on http://localhost:3001');
  
  setTimeout(() => {
    console.log('  📥 Downloading file...\n');
    
    http.get('http://localhost:3001/download', async (res) => {
      try {
        await pipeline(
          res,
          createWriteStream(downloadFile)
        );
        
        console.log('  ✅ File downloaded successfully');
        console.log(`  📄 Saved to: ${downloadFile}`);
        console.log(`  📊 Size: ${(fs.statSync(downloadFile).size / 1024).toFixed(2)} KB\n`);
        
        // Cleanup
        downloadServer.close();
        if (fs.existsSync(downloadFile)) {
          fs.unlinkSync(downloadFile);
        }
      } catch (error) {
        console.error('  ❌ Download error:', error.message);
      }
    });
  }, 500);
});

// ============================================
// PART 3: Streaming API Response
// ============================================
console.log('--- PART 3: Streaming API Response ---\n');

import { Transform } from 'stream';

class JSONStreamTransform extends Transform {
  constructor() {
    super({ objectMode: true });
    this.first = true;
  }
  
  _transform(chunk, encoding, callback) {
    if (this.first) {
      this.push('[\n');
      this.first = false;
    } else {
      this.push(',\n');
    }
    
    this.push(JSON.stringify(chunk, null, 2));
    callback();
  }
  
  _flush(callback) {
    this.push('\n]');
    callback();
  }
}

const apiServer = http.createServer((req, res) => {
  if (req.url === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    });
    
    // Stream JSON data
    const jsonTransform = new JSONStreamTransform();
    
    // Generate data and stream
    let count = 0;
    const interval = setInterval(() => {
      const data = {
        id: ++count,
        timestamp: new Date().toISOString(),
        value: Math.random() * 100
      };
      
      jsonTransform.write(data);
      
      if (count >= 5) {
        clearInterval(interval);
        jsonTransform.end();
      }
    }, 200);
    
    jsonTransform.pipe(res);
    
    jsonTransform.on('end', () => {
      console.log('  ✅ JSON streaming complete\n');
      apiServer.close();
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

apiServer.listen(3002, () => {
  console.log('  🚀 API server on http://localhost:3002');
  console.log('  📡 Endpoint: http://localhost:3002/api/stream\n');
  
  setTimeout(() => {
    console.log('  📥 Requesting streaming JSON...\n');
    
    http.get('http://localhost:3002/api/stream', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write('📥');
      });
      
      res.on('end', () => {
        console.log('\n  ✅ Received streaming JSON:');
        console.log(data);
        console.log('');
      });
    });
  }, 500);
});

/*
REAL-WORLD USE CASES:
1. ✅ Streaming large API responses
2. ✅ File downloads/uploads
3. ✅ Real-time data streaming
4. ✅ Progress tracking
5. ✅ Memory-efficient HTTP operations
*/

