# 📡 API Examples - Google Search Engine Backend

Complete API usage examples with curl commands.

---

## 🔍 Search APIs

### 1. Search Query

```bash
curl "http://localhost:3000/api/v1/search?q=machine+learning&page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "query": "machine learning",
  "results": [...],
  "total": 1250,
  "page": 1,
  "limit": 10,
  "searchTimeMs": 45
}
```

### 2. Autocomplete

```bash
curl "http://localhost:3000/api/v1/autocomplete?q=machine+lea"
```

**Response:**
```json
{
  "success": true,
  "query": "machine lea",
  "suggestions": [
    {"text": "machine learning", "frequency": 125000},
    {"text": "machine learning algorithms", "frequency": 45000}
  ]
}
```

---

## 🕷️ Crawler APIs

### 3. Add URL to Queue

```bash
curl -X POST http://localhost:3000/api/v1/crawl/add \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "priority": 3,
    "depth": 0
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "URL added to crawl queue",
  "queueId": "uuid",
  "url": "https://example.com"
}
```

### 4. Crawl Single URL

```bash
curl -X POST http://localhost:3000/api/v1/crawl/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "URL crawled and indexed successfully",
  "pageId": "uuid",
  "url": "https://example.com"
}
```

### 5. Process Crawl Queue

```bash
curl -X POST http://localhost:3000/api/v1/crawl/process \
  -H "Content-Type: application/json" \
  -d '{
    "batchSize": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Crawl queue processed",
  "processed": 10,
  "successful": 8,
  "failed": 2
}
```

### 6. Get Crawl Queue Status

```bash
curl http://localhost:3000/api/v1/crawl/status
```

**Response:**
```json
{
  "success": true,
  "queue": {
    "PENDING": 150,
    "CRAWLING": 5,
    "COMPLETED": 1250,
    "FAILED": 10
  }
}
```

---

## 🔧 Admin APIs

### 7. Get System Statistics

```bash
curl http://localhost:3000/api/v1/admin/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalPages": 1250,
    "indexedPages": 1200,
    "totalLinks": 5000,
    "queriesLast24h": 500,
    "pendingUrls": 150
  },
  "timestamp": "2024-12-21T14:30:00.000Z"
}
```

### 8. Calculate PageRank

```bash
curl -X POST http://localhost:3000/api/v1/admin/pagerank \
  -H "Content-Type: application/json" \
  -d '{
    "iterations": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "PageRank calculation started",
  "iterations": 10
}
```

### 9. Reindex Page

```bash
curl -X POST http://localhost:3000/api/v1/admin/reindex/{pageId}
```

**Response:**
```json
{
  "success": true,
  "message": "Page reindexed successfully",
  "pageId": "uuid"
}
```

---

## 🎯 Complete Workflow Example

### Step 1: Add Seed URLs

```bash
# Add multiple URLs
curl -X POST http://localhost:3000/api/v1/crawl/add \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "priority": 3}'

curl -X POST http://localhost:3000/api/v1/crawl/add \
  -H "Content-Type: application/json" \
  -d '{"url": "https://wikipedia.org/wiki/Machine_learning", "priority": 1}'
```

### Step 2: Process Queue

```bash
# Process 10 URLs
curl -X POST http://localhost:3000/api/v1/crawl/process \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

### Step 3: Calculate PageRank

```bash
# Calculate PageRank (after some pages indexed)
curl -X POST http://localhost:3000/api/v1/admin/pagerank \
  -H "Content-Type: application/json" \
  -d '{"iterations": 10}'
```

### Step 4: Search

```bash
# Search for indexed content
curl "http://localhost:3000/api/v1/search?q=machine+learning&limit=10"
```

### Step 5: Get Autocomplete

```bash
# Get suggestions
curl "http://localhost:3000/api/v1/autocomplete?q=machine+lea"
```

---

## 📊 Using Postman

1. Import collection (create from examples above)
2. Set base URL: `http://localhost:3000`
3. Test endpoints

---

## 🔄 Background Processing

For continuous crawling, you can set up a cron job or background worker:

```javascript
// Run every minute
setInterval(async () => {
    const CrawlerService = require('./src/services/CrawlerService');
    await CrawlerService.processQueue(10);
}, 60000);
```

---

**All APIs are ready to use! 🚀**
