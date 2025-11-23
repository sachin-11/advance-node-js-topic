# 🌊 Node.js Streams & Pipelines - Real World Examples

यह project Node.js Streams और Pipelines को practically demonstrate करता है real-world examples के साथ।

## 📚 Table of Contents

1. [Streams क्या हैं?](#streams-क्या-हैं)
2. [Types of Streams](#types-of-streams)
3. [Why Use Streams?](#why-use-streams)
4. [Examples](#examples)
5. [Installation](#installation)
6. [How to Run](#how-to-run)

---

## 🎯 Streams क्या हैं?

Streams Node.js में **data को chunks में process करने** का तरीका है। बड़ी files या data को memory में load किए बिना process कर सकते हैं।

### Key Benefits:
- ✅ **Memory Efficient**: पूरी file memory में load नहीं होती
- ✅ **Fast**: Data chunks में process होता है
- ✅ **Scalable**: Large files handle कर सकते हैं
- ✅ **Composable**: Pipelines बना सकते हैं

---

## 🔄 Types of Streams

### 1. **Readable Stream** 📖
- Data read करता है
- Examples: `fs.createReadStream()`, HTTP request

### 2. **Writable Stream** ✍️
- Data write करता है
- Examples: `fs.createWriteStream()`, HTTP response

### 3. **Transform Stream** 🔄
- Data read करके transform करके write करता है
- Examples: Compression, Encryption, Data transformation

### 4. **Duplex Stream** ↔️
- Readable और Writable दोनों
- Examples: TCP sockets, WebSockets

---

## 💡 Why Use Streams?

### Without Streams (Bad):
```javascript
// ❌ Entire file loaded in memory
const data = fs.readFileSync('large-file.txt'); // 1GB file = 1GB RAM!
processData(data);
```

### With Streams (Good):
```javascript
// ✅ File processed in chunks
fs.createReadStream('large-file.txt')
  .pipe(transformStream)
  .pipe(fs.createWriteStream('output.txt'));
// Only small chunks in memory!
```

---

## 📁 Examples

### 1. Basic Streams (`01-basic-streams.js`)
```bash
npm run basic
```
- Readable, Writable, Transform streams
- Basic stream operations
- Understanding stream events

### 2. Pipelines (`02-pipelines.js`)
```bash
npm run pipeline
```
- `pipeline()` function usage
- Error handling in pipelines
- Multiple stream chaining

### 3. File Streaming (`03-file-streaming.js`)
```bash
npm run file
```
- Reading large files
- Writing files with streams
- File copy with streams

### 4. Transform Streams (`04-transform-streams.js`)
```bash
npm run transform
```
- Custom transform streams
- Data transformation
- Chunk processing

### 5. CSV Processing (`05-csv-processing.js`)
```bash
npm run csv
```
- CSV parsing with streams
- Large CSV file processing
- Data transformation

### 6. HTTP Streaming (`06-http-streaming.js`)
```bash
npm run http
```
- HTTP request/response streaming
- Downloading files
- Streaming API responses

### 7. Large File Handling (`07-large-file-handling.js`)
```bash
npm run large-file
```
- Processing very large files
- Memory-efficient operations
- Progress tracking

### 8. Log Processing (`08-log-processing.js`)
```bash
npm run log
```
- Reading log files
- Filtering and processing logs
- Real-time log streaming

### 9. Backpressure Handling (`09-backpressure-handling.js`)
```bash
npm run backpressure
```
- Understanding backpressure
- Handling slow consumers
- Flow control

---

## 🚀 Installation

### 1. Install Dependencies:
```bash
npm install
```

### 2. Prepare Test Data (Optional):
- Some examples create test files automatically
- For CSV example, test data is generated
- For file examples, sample files are created

### 3. Run Examples:
```bash
npm run basic
npm run pipeline
# ... etc
```

---

## 🚀 How to Run

### Run Individual Examples:
```bash
npm run basic
npm run pipeline
npm run file
npm run transform
npm run csv
npm run http
npm run large-file
npm run log
npm run backpressure
```

### Run All Examples:
```bash
npm run all
```

### Or Directly:
```bash
node 01-basic-streams.js
node 02-pipelines.js
# ... etc
```

---

## 🔑 Key Concepts

### 1. **Stream Events**

```javascript
stream.on('data', (chunk) => {
  // Data chunk received
});

stream.on('end', () => {
  // Stream finished
});

stream.on('error', (err) => {
  // Error occurred
});
```

### 2. **Pipelines**

```javascript
import { pipeline } from 'stream/promises';

await pipeline(
  readableStream,
  transformStream,
  writableStream
);
```

### 3. **Backpressure**

- Fast producer + Slow consumer = Backpressure
- Streams automatically handle this
- `pause()` and `resume()` for manual control

### 4. **When to Use Streams**

✅ **Use for:**
- Large files
- Network data
- Real-time data processing
- Data transformation pipelines
- Log processing

❌ **Don't use for:**
- Small files (< 1MB)
- Simple operations
- When you need entire data in memory

---

## 💡 Important Takeaways

1. ✅ Streams **memory efficient** हैं
2. ✅ **Large files** handle कर सकते हैं
3. ✅ **Pipelines** compose कर सकते हैं
4. ✅ **Backpressure** automatically handle होता है
5. ✅ **Real-time processing** possible है

---

## 🛠️ Technologies Used

- **Node.js Streams API** (Native)
- **csv-parse** (CSV parsing)
- **csv-stringify** (CSV generation)
- **fs module** (File operations)
- **http module** (HTTP streaming)

---

## 📖 Further Reading

- [Node.js Streams Official Docs](https://nodejs.org/api/stream.html)
- [Streams Handbook](https://github.com/substack/stream-handbook)

---

**Happy Learning! 🎓**

