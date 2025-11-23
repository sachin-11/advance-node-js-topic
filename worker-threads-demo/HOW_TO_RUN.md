# 🚀 How to Run Examples

## ✅ Correct Commands

### Basic Example (No images needed):
```bash
npm run basic
```

### Image Compression Examples:
```bash
# Blocking approach (bad)
npm run image-blocking

# Worker thread approach (good)
npm run image-worker
```

### Multiple Workers:
```bash
npm run multiple
```

### Worker Pool:
```bash
npm run pool
```

### Performance Comparison:
```bash
npm run compare
```

### Run All Examples:
```bash
npm run all
```

## ❌ Wrong Way (Don't use file names):
```bash
# ❌ WRONG
npm run basic-worker.js
npm run 01-basic-worker.js

# ✅ CORRECT
npm run basic
```

## 📝 Direct Node Commands (Alternative):

अगर npm scripts use नहीं करना चाहते, तो directly node से भी run कर सकते हैं:

```bash
# Direct node commands
node 01-basic-worker.js
node 02-image-compression-blocking.js
node 03-image-compression-worker.js
node 04-multiple-workers.js
node 05-worker-pool.js
node 06-performance-comparison.js
```

## 💡 Quick Reference:

| Command | Runs File |
|---------|-----------|
| `npm run basic` | `01-basic-worker.js` |
| `npm run image-blocking` | `02-image-compression-blocking.js` |
| `npm run image-worker` | `03-image-compression-worker.js` |
| `npm run multiple` | `04-multiple-workers.js` |
| `npm run pool` | `05-worker-pool.js` |
| `npm run compare` | `06-performance-comparison.js` |
| `npm run all` | `run-all.js` |

## 🎯 Start Here:

1. **First time?** Start with:
   ```bash
   npm run basic
   ```
   (No images needed for this one!)

2. **For image examples**, add images to `./images/` folder first, then:
   ```bash
   npm run image-worker
   ```

Happy Learning! 🎓

