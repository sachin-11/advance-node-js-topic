# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Add Test Images

1. Create an `images` folder in the project root (if not exists)
2. Add some test images (JPEG, PNG, or WebP format)
3. You can use any images you have, or download sample images

### Example:
```bash
mkdir images
# Copy some images to ./images/ folder
cp ~/Pictures/*.jpg ./images/
```

## Step 3: Run Examples

### Basic Example:
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

### Run All:
```bash
npm run all
```

## 📝 Notes

- Make sure you have at least 1-3 test images in the `./images/` folder
- Image compression uses the `sharp` library (installed via npm)
- Worker threads work best with CPU-intensive tasks
- The examples demonstrate real-world image compression scenarios

## 🎯 What You'll Learn

1. ✅ How worker threads work
2. ✅ Blocking vs Non-blocking approaches
3. ✅ Parallel processing with multiple workers
4. ✅ Worker pool pattern for efficiency
5. ✅ Real performance comparisons

Happy Learning! 🎓

