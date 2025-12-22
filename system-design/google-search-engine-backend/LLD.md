# 🔍 Google Search Engine - Low Level Design (LLD)

Complete Low Level Design document for Google Search Engine implementation.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Design](#database-design)
3. [API Design](#api-design)
4. [Component Design](#component-design)
5. [Algorithm Details](#algorithm-details)
6. [Data Flow](#data-flow)
7. [Performance Optimization](#performance-optimization)
8. [Scalability](#scalability)

---

## 🏗️ System Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Web UI, Mobile App, API Gateway                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Layer                               │
│  REST APIs, GraphQL, WebSocket                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Application Layer                           │
│  Search Service, Crawler Service, Indexer Service       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Data Layer                                  │
│  PostgreSQL, Redis, Elasticsearch, S3                   │
└──────────────────────────────────────────────────────────┘
```

### Core Components

1. **Web Crawler** - Crawls and indexes web pages
2. **Indexer** - Builds inverted index from crawled content
3. **Search Engine** - Processes queries and returns results
4. **Ranking Algorithm** - Ranks results by relevance
5. **Cache Layer** - Caches frequent queries
6. **Analytics** - Tracks user behavior

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ web_pages   │◄────────┤   links      │────────►│ web_pages   │
│             │         │              │         │             │
│ - id        │         │ - from_page  │         │ - id        │
│ - url       │         │ - to_page    │         │ - url       │
│ - title     │         │ - anchor_text│         │ - title     │
│ - content   │         └──────────────┘         │ - page_rank │
│ - page_rank│                                  └─────────────┘
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐         ┌──────────────┐
│ inverted_index  │         │ search_cache │
│                 │         │              │
│ - word          │         │ - query_hash │
│ - page_id       │         │ - results    │
│ - tf            │         │ - expires_at │
│ - positions     │         └──────────────┘
└─────────────────┘
```

### Key Tables

#### 1. **web_pages**
Stores crawled web pages
- **Primary Key**: `id` (UUID)
- **Indexes**: `url`, `domain`, `last_crawled_at`, `page_rank`
- **Size Estimate**: ~1TB for 1 billion pages

#### 2. **inverted_index**
Word to document mapping
- **Primary Key**: `id` (BIGSERIAL)
- **Indexes**: `word`, `page_id`, `(word, page_id)`
- **Size Estimate**: ~10TB for 1 billion pages

#### 3. **document_frequency**
Document frequency for TF-IDF
- **Primary Key**: `word` (VARCHAR)
- **Indexes**: `document_count`
- **Size Estimate**: ~100GB

#### 4. **links**
Page-to-page links for PageRank
- **Primary Key**: `id` (BIGSERIAL)
- **Indexes**: `from_page_id`, `to_page_id`
- **Size Estimate**: ~500GB for 10 billion links

#### 5. **page_rank**
PageRank scores
- **Primary Key**: `page_id` (UUID)
- **Indexes**: `rank_value`
- **Size Estimate**: ~50GB

#### 6. **search_cache**
Cached search results
- **Primary Key**: `id` (UUID)
- **Indexes**: `query_hash`, `expires_at`
- **TTL**: 1 hour

---

## 🔌 API Design

### REST API Endpoints

#### Search APIs

##### 1. Search
```
GET /api/v1/search?q={query}&page={page}&limit={limit}
```

**Request:**
```json
{
  "query": "machine learning",
  "page": 1,
  "limit": 10,
  "filters": {
    "language": "en",
    "date_range": "past_year",
    "domain": "example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "machine learning",
  "total_results": 1250000,
  "page": 1,
  "limit": 10,
  "results": [
    {
      "id": "uuid",
      "title": "Machine Learning | Google AI",
      "url": "https://ai.google/research/",
      "snippet": "Machine learning is a method of data analysis...",
      "rank": 1,
      "score": 0.95,
      "page_rank": 0.85,
      "last_crawled": "2024-12-20T10:30:00Z"
    }
  ],
  "suggestions": ["machine learning algorithms", "machine learning course"],
  "search_time_ms": 45
}
```

##### 2. Autocomplete
```
GET /api/v1/autocomplete?q={partial_query}
```

**Response:**
```json
{
  "success": true,
  "query": "machine lea",
  "suggestions": [
    {
      "text": "machine learning",
      "frequency": 125000
    },
    {
      "text": "machine learning algorithms",
      "frequency": 45000
    }
  ]
}
```

##### 3. Related Searches
```
GET /api/v1/related?q={query}
```

**Response:**
```json
{
  "success": true,
  "query": "machine learning",
  "related": [
    "deep learning",
    "neural networks",
    "artificial intelligence"
  ]
}
```

#### Admin APIs

##### 4. Add URL to Crawl Queue
```
POST /api/v1/admin/crawl
```

**Request:**
```json
{
  "url": "https://example.com/page",
  "priority": 8,
  "depth": 0
}
```

##### 5. Get Crawl Status
```
GET /api/v1/admin/crawl/status?url={url}
```

##### 6. Reindex Page
```
POST /api/v1/admin/reindex
```

**Request:**
```json
{
  "page_id": "uuid"
}
```

#### Analytics APIs

##### 7. Search Analytics
```
GET /api/v1/analytics/searches?start_date={date}&end_date={date}
```

##### 8. Top Queries
```
GET /api/v1/analytics/top-queries?limit={limit}
```

---

## 🧩 Component Design

### 1. Crawler Service

#### Class: WebCrawler

```javascript
class WebCrawler {
    constructor(config) {
        this.queue = new CrawlQueue();
        this.robotsCache = new RobotsCache();
        this.httpClient = new HttpClient();
        this.parser = new HTMLParser();
    }

    async crawl(url) {
        // 1. Check robots.txt
        if (!await this.robotsCache.isAllowed(url)) {
            return { skipped: true, reason: 'robots.txt' };
        }

        // 2. Fetch page
        const response = await this.httpClient.fetch(url);
        
        // 3. Parse HTML
        const parsed = await this.parser.parse(response.body);
        
        // 4. Extract links
        const links = parsed.extractLinks();
        
        // 5. Save to database
        await this.savePage(url, parsed, response);
        
        // 6. Add links to queue
        await this.queue.addLinks(links, url);
        
        return { success: true };
    }

    async savePage(url, parsed, response) {
        const page = {
            url: url,
            title: parsed.title,
            content: parsed.text,
            meta_description: parsed.metaDescription,
            links: parsed.links,
            status_code: response.status,
            last_crawled_at: new Date()
        };
        
        await db.webPages.upsert(page);
    }
}
```

#### Crawl Queue Manager

```javascript
class CrawlQueueManager {
    async getNextBatch(size = 100) {
        return await db.query(`
            SELECT * FROM crawl_queue
            WHERE status = 'PENDING'
            ORDER BY priority ASC, scheduled_at ASC
            LIMIT $1
            FOR UPDATE SKIP LOCKED
        `, [size]);
    }

    async markCrawling(id) {
        await db.query(`
            UPDATE crawl_queue
            SET status = 'CRAWLING', crawled_at = NOW()
            WHERE id = $1
        `, [id]);
    }

    async markCompleted(id) {
        await db.query(`
            UPDATE crawl_queue
            SET status = 'COMPLETED'
            WHERE id = $1
        `, [id]);
    }
}
```

### 2. Indexer Service

#### Class: Indexer

```javascript
class Indexer {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.stopWords = new StopWords();
    }

    async indexPage(pageId, content) {
        // 1. Tokenize content
        const tokens = this.tokenizer.tokenize(content);
        
        // 2. Remove stop words
        const filteredTokens = tokens.filter(t => !this.stopWords.contains(t));
        
        // 3. Calculate term frequency
        const termFreq = this.calculateTermFrequency(filteredTokens);
        
        // 4. Get positions
        const positions = this.getPositions(filteredTokens);
        
        // 5. Save to inverted index
        await this.saveInvertedIndex(pageId, termFreq, positions);
        
        // 6. Update document frequency
        await this.updateDocumentFrequency(termFreq);
    }

    calculateTermFrequency(tokens) {
        const freq = {};
        tokens.forEach((token, index) => {
            if (!freq[token]) {
                freq[token] = { count: 0, positions: [] };
            }
            freq[token].count++;
            freq[token].positions.push(index);
        });
        return freq;
    }

    async saveInvertedIndex(pageId, termFreq, positions) {
        const inserts = Object.entries(termFreq).map(([word, data]) => ({
            word: word,
            page_id: pageId,
            term_frequency: data.count,
            positions: data.positions
        }));
        
        await db.invertedIndex.bulkInsert(inserts);
    }
}
```

### 3. Search Service

#### Class: SearchEngine

```javascript
class SearchEngine {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.ranker = new Ranker();
        this.cache = new RedisCache();
    }

    async search(query, options = {}) {
        // 1. Check cache
        const cacheKey = this.getCacheKey(query);
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // 2. Tokenize query
        const queryTokens = this.tokenizer.tokenize(query);
        
        // 3. Get matching documents
        const documents = await this.getMatchingDocuments(queryTokens);
        
        // 4. Rank documents
        const ranked = await this.ranker.rank(documents, queryTokens);
        
        // 5. Format results
        const results = this.formatResults(ranked, options);
        
        // 6. Cache results
        await this.cache.set(cacheKey, results, 3600);
        
        return results;
    }

    async getMatchingDocuments(queryTokens) {
        // Get documents containing all query terms
        const query = `
            SELECT 
                ii.page_id,
                wp.url,
                wp.title,
                wp.meta_description,
                SUM(ii.term_frequency) as total_tf,
                COUNT(DISTINCT ii.word) as matched_terms
            FROM inverted_index ii
            JOIN web_pages wp ON ii.page_id = wp.id
            WHERE ii.word = ANY($1)
            AND wp.is_indexed = true
            GROUP BY ii.page_id, wp.url, wp.title, wp.meta_description
            HAVING COUNT(DISTINCT ii.word) = $2
            ORDER BY total_tf DESC
            LIMIT 1000
        `;
        
        return await db.query(query, [queryTokens, queryTokens.length]);
    }
}
```

### 4. Ranking Service

#### Class: Ranker

```javascript
class Ranker {
    constructor() {
        this.tfidfCalculator = new TFIDFCalculator();
        this.pageRankService = new PageRankService();
    }

    async rank(documents, queryTokens) {
        const totalDocs = await this.getTotalDocuments();
        
        return documents.map(doc => {
            // Calculate TF-IDF score
            const tfidfScore = this.calculateTFIDF(doc, queryTokens, totalDocs);
            
            // Get PageRank
            const pageRankScore = doc.page_rank || 0;
            
            // Combine scores
            const finalScore = (
                tfidfScore * 0.6 +
                pageRankScore * 0.3 +
                doc.matched_terms / queryTokens.length * 0.1
            );
            
            return {
                ...doc,
                score: finalScore,
                tfidf_score: tfidfScore,
                page_rank_score: pageRankScore
            };
        }).sort((a, b) => b.score - a.score);
    }

    calculateTFIDF(doc, queryTokens, totalDocs) {
        let score = 0;
        
        queryTokens.forEach(token => {
            const tf = doc.term_frequency || 0;
            const df = this.getDocumentFrequency(token);
            
            if (df > 0) {
                const tfidf = Math.log(1 + tf) * Math.log(totalDocs / df);
                score += tfidf;
            }
        });
        
        return score;
    }
}
```

---

## 🔢 Algorithm Details

### 1. TF-IDF Calculation

```
TF-IDF(t, d, D) = TF(t, d) × IDF(t, D)

Where:
- TF(t, d) = (Number of times term t appears in document d) / (Total terms in d)
- IDF(t, D) = log(Total documents / Documents containing term t)
```

**Implementation:**
```sql
SELECT 
    word,
    page_id,
    term_frequency as tf,
    (SELECT document_count FROM document_frequency WHERE word = ii.word) as df,
    calculate_tfidf(
        term_frequency,
        (SELECT document_count FROM document_frequency WHERE word = ii.word),
        (SELECT COUNT(*) FROM web_pages WHERE is_indexed = true)
    ) as tfidf_score
FROM inverted_index ii
WHERE word = 'machine'
ORDER BY tfidf_score DESC;
```

### 2. PageRank Algorithm

```
PR(A) = (1-d) + d × Σ(PR(Ti) / C(Ti))

Where:
- PR(A) = PageRank of page A
- d = damping factor (0.85)
- Ti = Pages linking to A
- C(Ti) = Outgoing links from Ti
```

**Implementation:**
```javascript
async function calculatePageRank(iterations = 10) {
    const dampingFactor = 0.85;
    const totalPages = await getTotalPages();
    
    // Initialize PageRank
    await initializePageRank(1.0 / totalPages);
    
    for (let i = 0; i < iterations; i++) {
        // Calculate new PageRank for each page
        const pages = await getAllPages();
        
        for (const page of pages) {
            const incomingLinks = await getIncomingLinks(page.id);
            let prSum = 0;
            
            for (const link of incomingLinks) {
                const fromPage = await getPage(link.from_page_id);
                const outgoingCount = await getOutgoingLinkCount(link.from_page_id);
                prSum += fromPage.page_rank / outgoingCount;
            }
            
            const newPR = (1 - dampingFactor) + dampingFactor * prSum;
            await updatePageRank(page.id, newPR);
        }
    }
}
```

### 3. Query Processing

```
1. Tokenize query: "machine learning" → ["machine", "learning"]
2. Remove stop words: ["machine", "learning"] (no stop words)
3. Get matching documents from inverted index
4. Calculate relevance scores (TF-IDF + PageRank)
5. Rank and return top N results
```

---

## 🔄 Data Flow

### Search Flow

```
User Query
    ↓
[API Gateway]
    ↓
[Cache Check] → Hit? → Return Cached Results
    ↓ Miss
[Query Parser] → Tokenize & Normalize
    ↓
[Search Service] → Get Matching Documents
    ↓
[Ranking Service] → Calculate Scores (TF-IDF + PageRank)
    ↓
[Result Formatter] → Format & Add Snippets
    ↓
[Cache] → Store Results
    ↓
Return Results to User
```

### Crawling Flow

```
Seed URLs
    ↓
[Crawl Queue] → Add URLs
    ↓
[Crawler] → Fetch Page
    ↓
[HTML Parser] → Extract Content & Links
    ↓
[Content Filter] → Check Quality
    ↓
[Indexer] → Build Inverted Index
    ↓
[Database] → Save Page & Index
    ↓
[Link Extractor] → Add New URLs to Queue
```

---

## ⚡ Performance Optimization

### 1. Database Indexes

```sql
-- Composite index for search queries
CREATE INDEX idx_inverted_index_search 
ON inverted_index(word, page_id) 
INCLUDE (term_frequency, positions);

-- Partial index for pending crawl queue
CREATE INDEX idx_crawl_queue_pending 
ON crawl_queue(priority, scheduled_at) 
WHERE status = 'PENDING';

-- GIN index for full-text search
CREATE INDEX idx_web_pages_content_gin 
ON web_pages USING gin(to_tsvector('english', title || ' ' || meta_description));
```

### 2. Caching Strategy

- **Redis Cache**: 
  - Search results: 1 hour TTL
  - Autocomplete: 24 hours TTL
  - PageRank: 6 hours TTL

- **Application Cache**:
  - Document frequency: In-memory cache
  - Stop words: In-memory cache

### 3. Query Optimization

```sql
-- Optimized search query with pagination
SELECT 
    wp.id,
    wp.url,
    wp.title,
    wp.meta_description,
    pr.rank_value as page_rank,
    SUM(ii.term_frequency) as relevance_score
FROM inverted_index ii
JOIN web_pages wp ON ii.page_id = wp.id
LEFT JOIN page_rank pr ON wp.id = pr.page_id
WHERE ii.word = ANY($1)
AND wp.is_indexed = true
GROUP BY wp.id, wp.url, wp.title, wp.meta_description, pr.rank_value
HAVING COUNT(DISTINCT ii.word) = $2
ORDER BY relevance_score DESC, pr.rank_value DESC
LIMIT $3 OFFSET $4;
```

### 4. Connection Pooling

```javascript
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'search_engine',
    max: 100, // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

---

## 📈 Scalability

### Horizontal Scaling

1. **Crawler Workers**: Multiple crawler instances
2. **Indexer Workers**: Parallel indexing
3. **Search Servers**: Load balanced search servers
4. **Database Replication**: Read replicas for search queries

### Sharding Strategy

- **By Domain**: Shard web_pages by domain hash
- **By Word**: Shard inverted_index by word hash
- **By Date**: Partition search_queries by date

### Distributed Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Crawler 1  │    │  Crawler 2  │    │  Crawler 3  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Message Queue │
                  │   (RabbitMQ)   │
                  └───────┬────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│  Indexer 1  │    │  Indexer 2  │    │  Indexer 3  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                  ┌───────▼────────┐
                  │   PostgreSQL   │
                  │  (Sharded)     │
                  └────────────────┘
```

---

## 📊 Monitoring & Metrics

### Key Metrics

1. **Crawl Metrics**:
   - Pages crawled per minute
   - Crawl success rate
   - Queue size

2. **Search Metrics**:
   - Average query time
   - Cache hit rate
   - Results per query

3. **Index Metrics**:
   - Index size
   - Indexing rate
   - Index freshness

### Monitoring Queries

```sql
-- Crawl statistics
SELECT 
    DATE(last_crawled_at) as date,
    COUNT(*) as pages_crawled,
    AVG(EXTRACT(EPOCH FROM (updated_at - last_crawled_at))) as avg_crawl_time
FROM web_pages
WHERE last_crawled_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(last_crawled_at);

-- Search performance
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_searches,
    AVG(result_count) as avg_results,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY result_count) as p95_results
FROM search_queries
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at);
```

---

## 🔐 Security Considerations

1. **Rate Limiting**: Limit API requests per IP
2. **Input Validation**: Sanitize search queries
3. **SQL Injection Prevention**: Use parameterized queries
4. **Access Control**: Admin APIs require authentication
5. **Data Privacy**: Anonymize user IPs in analytics

---

## 📝 Implementation Checklist

- [ ] Database schema setup
- [ ] Crawler service implementation
- [ ] Indexer service implementation
- [ ] Search service implementation
- [ ] Ranking algorithm implementation
- [ ] API endpoints implementation
- [ ] Caching layer setup
- [ ] Monitoring & logging
- [ ] Load testing
- [ ] Documentation

---

**Last Updated**: December 2024
**Version**: 1.0.0
