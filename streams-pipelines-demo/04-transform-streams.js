// ============================================
// Example 4: Transform Streams
// ============================================
// Custom transform streams for data processing

import { Transform } from 'stream';
import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';

console.log('=== Transform Streams Example ===\n');

// ============================================
// PART 1: Basic Transform Stream
// ============================================
console.log('--- PART 1: Basic Transform Stream ---\n');

class UppercaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = chunk.toString().toUpperCase();
    this.push(transformed);
    callback();
  }
}

const source = new Readable({
  read() {}
});

const uppercase = new UppercaseTransform();
const destination = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  📤 ${chunk.toString()}`);
    callback();
  }
});

source.push('hello world\n');
source.push('streams are awesome\n');
source.push(null);

(async () => {
  await pipeline(source, uppercase, destination);
  console.log('  ✅ Transformation complete\n');
})();

// ============================================
// PART 2: JSON Transform
// ============================================
console.log('--- PART 2: JSON Transform Stream ---\n');

class JSONTransform extends Transform {
  _transform(chunk, encoding, callback) {
    try {
      const data = chunk.toString();
      const lines = data.split('\n').filter(line => line.trim());
      
      const jsonLines = lines.map((line, index) => {
        return JSON.stringify({
          id: index + 1,
          message: line,
          timestamp: new Date().toISOString()
        });
      }).join('\n') + '\n';
      
      this.push(jsonLines);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

const jsonSource = new Readable({
  read() {}
});

const jsonTransform = new JSONTransform();
const jsonDest = new Writable({
  write(chunk, encoding, callback) {
    const jsonObjects = chunk.toString().split('\n').filter(line => line.trim());
    jsonObjects.forEach(jsonStr => {
      const obj = JSON.parse(jsonStr);
      console.log(`  📋 ${JSON.stringify(obj, null, 2)}`);
    });
    callback();
  }
});

jsonSource.push('First message\n');
jsonSource.push('Second message\n');
jsonSource.push('Third message\n');
jsonSource.push(null);

(async () => {
  await pipeline(jsonSource, jsonTransform, jsonDest);
  console.log('  ✅ JSON transformation complete\n');
})();

// ============================================
// PART 3: Filter Transform
// ============================================
console.log('--- PART 3: Filter Transform Stream ---\n');

class FilterTransform extends Transform {
  constructor(filterFn) {
    super();
    this.filterFn = filterFn;
  }
  
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lines = data.split('\n').filter(line => line.trim());
    
    const filtered = lines
      .filter(this.filterFn)
      .join('\n');
    
    if (filtered) {
      this.push(filtered + '\n');
    }
    callback();
  }
}

const filterSource = new Readable({
  read() {}
});

// Filter: only lines containing "ERROR"
const errorFilter = new FilterTransform(line => line.includes('ERROR'));

const filterDest = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(`  🔍 Filtered: ${chunk.toString()}`);
    callback();
  }
});

filterSource.push('INFO: Application started\n');
filterSource.push('ERROR: Connection failed\n');
filterSource.push('INFO: Retrying\n');
filterSource.push('ERROR: Timeout occurred\n');
filterSource.push('INFO: Success\n');
filterSource.push(null);

(async () => {
  await pipeline(filterSource, errorFilter, filterDest);
  console.log('  ✅ Filtering complete\n');
})();

// ============================================
// PART 4: Encrypt/Decrypt Transform
// ============================================
console.log('--- PART 4: Encryption Transform ---\n');

class SimpleEncryptTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    // Simple Caesar cipher (shift by 3)
    const encrypted = data.split('').map(char => {
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + 3) % 26) + 97);
      } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + 3) % 26) + 65);
      }
      return char;
    }).join('');
    
    this.push(encrypted);
    callback();
  }
}

class SimpleDecryptTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    // Reverse Caesar cipher (shift back by 3)
    const decrypted = data.split('').map(char => {
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 - 3 + 26) % 26) + 97);
      } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 - 3 + 26) % 26) + 65);
      }
      return char;
    }).join('');
    
    this.push(decrypted);
    callback();
  }
}

const encryptSource = new Readable({
  read() {}
});

const encrypt = new SimpleEncryptTransform();
const decrypt = new SimpleDecryptTransform();
const encryptDest = new Writable({
  write(chunk, encoding, callback) {
    console.log(`  🔐 Encrypted: ${chunk.toString().trim()}`);
    callback();
  }
});

const decryptDest = new Writable({
  write(chunk, encoding, callback) {
    console.log(`  🔓 Decrypted: ${chunk.toString().trim()}\n`);
    callback();
  }
});

encryptSource.push('Hello World\n');
encryptSource.push(null);

(async () => {
  await pipeline(encryptSource, encrypt, encryptDest);
  
  // Decrypt
  const decryptSource = new Readable({
    read() {}
  });
  decryptSource.push('Khoor Zruog\n');
  decryptSource.push(null);
  
  await pipeline(decryptSource, decrypt, decryptDest);
})();

// ============================================
// PART 5: Data Aggregation Transform
// ============================================
console.log('--- PART 5: Data Aggregation Transform ---\n');

class SumTransform extends Transform {
  constructor() {
    super({ objectMode: true });
    this.sum = 0;
    this.count = 0;
  }
  
  _transform(chunk, encoding, callback) {
    const number = parseInt(chunk.toString());
    if (!isNaN(number)) {
      this.sum += number;
      this.count++;
    }
    callback();
  }
  
  _flush(callback) {
    // Called when stream ends
    this.push(`Sum: ${this.sum}, Count: ${this.count}, Average: ${(this.sum / this.count).toFixed(2)}\n`);
    callback();
  }
}

const sumSource = new Readable({
  objectMode: true,
  read() {}
});

const sumTransform = new SumTransform();
const sumDest = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    console.log(`  📊 ${chunk.toString()}`);
    callback();
  }
});

[10, 20, 30, 40, 50].forEach(num => {
  sumSource.push(num);
});
sumSource.push(null);

(async () => {
  await pipeline(sumSource, sumTransform, sumDest);
  console.log('  ✅ Aggregation complete\n');
})();

/*
KEY CONCEPTS:
1. Transform streams modify data as it flows
2. _transform() processes each chunk
3. _flush() called when stream ends (for final data)
4. Can chain multiple transforms
5. objectMode: true for non-string/buffer data
*/

