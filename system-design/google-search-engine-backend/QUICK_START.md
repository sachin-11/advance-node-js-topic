# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
cd google-search-engine-backend
npm install
```

## Step 2: Setup Database

```bash
# Create database
createdb google_search_engine

# Initialize schema
npm run db:init
```

## Step 3: Configure Environment

```bash
# Copy example file
cp env.example.txt .env

# Edit .env (optional, defaults work for local)
```

## Step 4: Start Server

```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 🧪 Testing the Backend

### 1. Add URLs to Crawl

```bash
# Add a URL
curl -X POST http://localhost:3000/api/v1/crawl/add \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "priority": 3}'
```

### 2. Process Crawl Queue

```bash
# Process 10 URLs
curl -X POST http://localhost:3000/api/v1/crawl/process \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

### 3. Search

```bash
# Search query
curl "http://localhost:3000/api/v1/search?q=example&limit=10"
```

### 4. Check Stats

```bash
# Get system statistics
curl http://localhost:3000/api/v1/admin/stats
```

---

## 📝 Complete Example Flow

```bash
# 1. Add seed URLs
curl -X POST http://localhost:3000/api/v1/crawl/add \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# 2. Crawl immediately (optional)
curl -X POST http://localhost:3000/api/v1/crawl/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# 3. Process queue (crawls and indexes)
curl -X POST http://localhost:3000/api/v1/crawl/process \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'

# 4. Calculate PageRank (after some pages indexed)
curl -X POST http://localhost:3000/api/v1/admin/pagerank \
  -H "Content-Type: application/json" \
  -d '{"iterations": 5}'

# 5. Search
curl "http://localhost:3000/api/v1/search?q=example"

# 6. Autocomplete
curl "http://localhost:3000/api/v1/autocomplete?q=exam"
```

---

## 🔍 Expected Results

### Search Response

```json
{
  "success": true,
  "query": "example",
  "results": [
    {
      "id": "uuid",
      "title": "Example Domain",
      "url": "https://example.com",
      "snippet": "This domain is for use in illustrative <strong>example</strong>s...",
      "domain": "example.com",
      "rank": 1,
      "score": 0.95,
      "pageRank": 0.85
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "searchTimeMs": 25
}
```

---

## 💡 Tips

1. **Start Small**: Add 2-3 URLs first to test
2. **Wait for Indexing**: After crawling, pages are automatically indexed
3. **Calculate PageRank**: Run PageRank calculation after indexing some pages
4. **Check Queue**: Use `/crawl/status` to see queue status
5. **Monitor Stats**: Use `/admin/stats` to track progress

---

**Happy Searching! 🔍**
