# ⚡ Quick Start Guide

## 🚀 3 Simple Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Test Images
```bash
# Create images folder
mkdir images

# Add your test images (any JPEG, PNG, or WebP files)
# You can copy images from anywhere:
cp ~/Pictures/*.jpg ./images/
# OR
# Download sample images from the internet
```

### 3. Run Examples
```bash
# Start with basic example
npm run basic

# Then try image compression
npm run image-worke

# Compare performance
npm run compare
```

## 📋 Example Files

1. **01-basic-worker.js** - Simple worker thread example (no images needed)
2. **02-image-compression-blocking.js** - Blocking approach (needs images)
3. **03-image-compression-worker.js** - Worker thread approach (needs images)
4. **04-multiple-workers.js** - Multiple images in parallel (needs images)
5. **05-worker-pool.js** - Efficient worker pool (needs images)
6. **06-performance-comparison.js** - Performance comparison (needs images)

## 💡 Tips

- Start with `01-basic-worker.js` - it doesn't need images
- For image examples, add at least 1-3 images to `./images/` folder
- Use JPEG or PNG images for best results
- Larger images will show more dramatic performance differences

## 🎯 What You'll See

- **Blocking approach**: Main thread freezes, server unresponsive
- **Worker threads**: Main thread stays responsive, parallel processing
- **Performance**: Worker threads are much faster for multiple tasks

Happy Learning! 🎓

