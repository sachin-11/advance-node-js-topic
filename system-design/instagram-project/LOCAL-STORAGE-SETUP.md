# Local Storage Setup Guide

## Overview

Instagram project ab **local file storage** support karta hai! Ab aapko AWS S3 ki zarurat nahi hai development ke liye. Images automatically `uploads/` folder mein store hongi.

---

## Quick Setup

### 1. Environment Variables

`.env` file mein ye add karein:

```env
# Storage Configuration
USE_S3=false

# Local Storage Settings
UPLOADS_DIR=uploads
BASE_URL=http://localhost:3000
```

**Important:** `USE_S3=false` set karein ya ise completely remove kar dein. Agar `USE_S3=true` nahi hai, to automatically local storage use hoga.

### 2. Uploads Directory

`uploads/` directory automatically create ho jayegi jab pehli baar image upload hogi. Aap manually bhi create kar sakte hain:

```bash
mkdir -p uploads/posts
```

### 3. Start Server

```bash
npm run dev
```

Ab images upload ho jayengi local storage mein! 🎉

---

## How It Works

### Storage Selection

System automatically decide karta hai ki S3 use karna hai ya local storage:

```typescript
// S3 use hoga agar:
USE_S3 === 'true' AND
AWS_ACCESS_KEY_ID exists AND
AWS_SECRET_ACCESS_KEY exists

// Otherwise local storage use hoga (default)
```

### File Structure

```
instagram-project/
├── uploads/                    # Local storage directory
│   └── posts/
│       └── {userId}/
│           ├── {postId}_original_{timestamp}.jpg
│           ├── {postId}_thumbnail_{timestamp}.jpg
│           ├── {postId}_medium_{timestamp}.jpg
│           └── {postId}_large_{timestamp}.jpg
├── src/
└── ...
```

### Image URLs

Local storage images ka URL format:
```
http://localhost:3000/uploads/posts/{userId}/{postId}_original_{timestamp}.jpg
```

Example:
```
http://localhost:3000/uploads/posts/1/123_original_1704110400000.jpg
```

---

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_S3` | `false` | Set to `true` to use AWS S3 |
| `UPLOADS_DIR` | `uploads` | Local storage directory path |
| `BASE_URL` | `http://localhost:3000` | Base URL for image URLs |

### Example `.env` File

**Local Storage (Development):**
```env
USE_S3=false
UPLOADS_DIR=uploads
BASE_URL=http://localhost:3000
```

**AWS S3 (Production):**
```env
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=instagram-photos
```

---

## Static File Serving

Express automatically serve karta hai images ko `/uploads` endpoint se:

```typescript
// In app.ts
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1y',  // Cache for 1 year
  etag: true,
}));
```

Ab aap directly browser mein image URL open kar sakte hain:
```
http://localhost:3000/uploads/posts/1/123_original_1704110400000.jpg
```

---

## Migration from S3 to Local Storage

Agar aap S3 se local storage switch karna chahte hain:

1. **Stop the server**

2. **Update `.env` file:**
   ```env
   USE_S3=false
   ```

3. **Remove AWS credentials** (optional):
   ```env
   # AWS_REGION=us-east-1
   # AWS_ACCESS_KEY_ID=...
   # AWS_SECRET_ACCESS_KEY=...
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test upload:**
   - Create a new post
   - Check `uploads/` folder
   - Verify image URLs

---

## Advantages of Local Storage

✅ **No AWS Account Needed** - Development ke liye perfect  
✅ **Fast** - No network latency  
✅ **Free** - No S3 costs  
✅ **Easy Setup** - Just set `USE_S3=false`  
✅ **Automatic** - Directory auto-create hoti hai  

---

## Production Considerations

⚠️ **Local storage production mein use mat karein** kyunki:

- Server restart par files delete ho sakti hain
- Scaling difficult hai
- No CDN support
- Disk space limitations

**Production ke liye AWS S3 use karein:**
```env
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
S3_BUCKET_NAME=instagram-photos-prod
S3_CDN_URL=https://cdn.yourdomain.com
```

---

## Troubleshooting

### Images Not Loading

1. **Check uploads directory exists:**
   ```bash
   ls -la uploads/
   ```

2. **Check BASE_URL:**
   ```env
   BASE_URL=http://localhost:3000
   ```

3. **Check static file serving:**
   - Server logs mein dikhega: `📁 Serving local uploads from: ...`

### Permission Errors

```bash
# Fix permissions
chmod -R 755 uploads/
```

### Disk Space

```bash
# Check disk usage
du -sh uploads/
```

---

## File Cleanup

Agar aap manually files delete karna chahte hain:

```bash
# Delete all uploads
rm -rf uploads/

# Delete old posts (older than 30 days)
find uploads/posts -type f -mtime +30 -delete
```

**Note:** Post delete karne par images automatically delete ho jayengi.

---

## Summary

✅ Local storage ab default hai  
✅ S3 optional hai (set `USE_S3=true`)  
✅ Images `uploads/` folder mein store hoti hain  
✅ Static file serving automatic hai  
✅ No AWS account needed for development  

**Happy Coding! 🚀**

