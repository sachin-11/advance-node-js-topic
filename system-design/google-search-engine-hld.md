# 🔍 Google Search Engine - High-Level Design (HLD)

Google Search Engine kaise kaam karta hai - Complete System Design

## 📚 Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [System Architecture](#system-architecture)
4. [Complete Flow](#complete-flow)
5. [Key Algorithms](#key-algorithms)
6. [Scalability](#scalability)

---

## 🎯 Overview

Google Search Engine एक **distributed system** है जो billions of web pages को **crawl**, **index**, और **rank** करता है, और milliseconds में relevant results provide करता है।

### Key Stats:
- 📊 **8.5 Billion** searches per day
- 🌐 **130 Trillion** web pages indexed
- ⚡ **<0.5 seconds** average response time
- 🖥️ **Millions** of servers worldwide

---

## 🏗️ Core Components

### 1. **Web Crawler (Googlebot)** 🕷️
Web pages को discover और download करता है।

### 2. **Indexer** 📚
Downloaded pages को process करके searchable index बनाता है।

### 3. **Query Processor** 🔍
User queries को समझता है और process करता है।

### 4. **Ranker (PageRank)** 📊
Results को relevance के according rank करता है।

### 5. **Serving System** 🚀
Final results को user को deliver करता है।

---

## 🔄 System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    USER (Browser)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Search Query: "node.js tutorial"
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              LOAD BALANCER (Global)                         │
│  - Distributes queries to nearest data center               │
│  - Handles billions of requests                             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Data Center 1  │     │  Data Center 2  │
│  (US)           │     │  (India)        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│              QUERY PROCESSOR                                │
│                                                             │
│  1. Query Understanding                                     │
│     ├─ Spell Check: "nde.js" → "node.js"                  │
│     ├─ Tokenization: ["node.js", "tutorial"]              │
│     ├─ Synonym Detection: "tutorial" = "guide"            │
│     └─ Intent Detection: Learning/Educational             │
│                                                             │
│  2. Query Expansion                                         │
│     ├─ Add related terms: "nodejs", "javascript"          │
│     └─ Consider user context (location, history)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              INDEX SERVERS (Distributed)                    │
│                                                             │
│  Inverted Index Structure:                                  │
│  ┌──────────────────────────────────────────────┐         │
│  │ Term        │ Document IDs                    │         │
│  ├──────────────────────────────────────────────┤         │
│  │ "node.js"   │ [doc1, doc5, doc100, ...]      │         │
│  │ "tutorial"  │ [doc1, doc3, doc50, ...]       │         │
│  │ "javascript"│ [doc1, doc2, doc10, ...]       │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  Sharding Strategy:                                         │
│  - Index partitioned by term (Term-based sharding)          │
│  - Each shard handles subset of vocabulary                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Matching Documents: [doc1, doc5, doc50, ...]
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              RANKING SYSTEM (PageRank + ML)                 │
│                                                             │
│  1. PageRank Score                                          │
│     ├─ Based on backlinks quality                          │
│     ├─ Authority of linking pages                          │
│     └─ Link graph analysis                                 │
│                                                             │
│  2. Content Relevance                                       │
│     ├─ TF-IDF (Term Frequency - Inverse Document Freq)     │
│     ├─ Keyword density                                     │
│     ├─ Title, headings, meta tags                          │
│     └─ Content freshness                                   │
│                                                             │
│  3. User Signals                                            │
│     ├─ Click-through rate (CTR)                            │
│     ├─ Dwell time (time on page)                           │
│     ├─ Bounce rate                                         │
│     └─ User engagement                                     │
│                                                             │
│  4. Machine Learning Models                                 │
│     ├─ RankBrain (AI-based ranking)                        │
│     ├─ BERT (Natural Language Understanding)               │
│     └─ Neural Matching                                     │
│                                                             │
│  Final Score = f(PageRank, Relevance, UserSignals, ML)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Ranked Results: [doc1, doc5, doc3, ...]
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVING SYSTEM                                 │
│                                                             │
│  1. Snippet Generation                                      │
│     ├─ Extract relevant text around keywords               │
│     ├─ Highlight matching terms                            │
│     └─ Generate meta description                           │
│                                                             │
│  2. Personalization                                         │
│     ├─ User location                                       │
│     ├─ Search history                                      │
│     └─ Preferences                                         │
│                                                             │
│  3. Rich Results                                            │
│     ├─ Featured snippets                                   │
│     ├─ Knowledge graph                                     │
│     ├─ Images, videos                                      │
│     └─ Related searches                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Final HTML Response
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER (Browser)                           │
│                                                             │
│  Search Results Page:                                       │
│  ┌─────────────────────────────────────────────┐         │
│  │ 1. Node.js Tutorial - Official Docs         │         │
│  │    https://nodejs.org/tutorial              │         │
│  │    Complete guide to Node.js...             │         │
│  │                                              │         │
│  │ 2. Learn Node.js - W3Schools                │         │
│  │    https://w3schools.com/nodejs              │         │
│  │    Step-by-step Node.js tutorial...         │         │
│  └─────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📋 Complete Flow

### Phase 1: Web Crawling (Continuous Process)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              GOOGLEBOT (Web Crawler)                        │
└─────────────────────────────────────────────────────────────┘

Step 1: URL Discovery
├─ Start with seed URLs
├─ Follow links from known pages
├─ Check sitemap.xml files
└─ Monitor social media, news feeds

Step 2: Crawl Queue Management
├─ Priority queue based on:
│  ├─ PageRank score
│  ├─ Update frequency
│  └─ Crawl budget per domain
└─ Politeness policy (rate limiting)

Step 3: Fetching
├─ HTTP GET request to URL
├─ Respect robots.txt
├─ Handle redirects (301, 302)
└─ Download HTML, CSS, JS, images

Step 4: Rendering
├─ Execute JavaScript (for SPAs)
├─ Render dynamic content
└─ Extract final DOM

Step 5: Storage
├─ Store raw HTML
├─ Store metadata (headers, status codes)
└─ Add to processing queue
\`\`\`

### Phase 2: Indexing

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              INDEXER                                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Content Extraction
├─ Parse HTML structure
├─ Extract text content
├─ Identify title, headings (H1, H2, ...)
├─ Extract meta tags (description, keywords)
└─ Extract links (for crawling)

Step 2: Text Processing
├─ Tokenization: "Node.js tutorial" → ["node", "js", "tutorial"]
├─ Stemming: "running" → "run"
├─ Stop word removal: Remove "the", "a", "is"
└─ Language detection

Step 3: Inverted Index Creation
┌──────────────────────────────────────────────┐
│ Term        │ Document IDs (with positions)  │
├──────────────────────────────────────────────┤
│ "node"      │ doc1[pos:0,15], doc5[pos:2]   │
│ "tutorial"  │ doc1[pos:1], doc3[pos:0]      │
│ "javascript"│ doc1[pos:20], doc2[pos:5]     │
└──────────────────────────────────────────────┘

Step 4: Additional Indexes
├─ Image index (alt text, surrounding text)
├─ Video index (title, description, transcripts)
├─ News index (freshness priority)
└─ Local index (location-based)

Step 5: Store in Distributed Storage
├─ Shard across multiple servers
├─ Replicate for fault tolerance
└─ Compress for efficiency
\`\`\`

### Phase 3: Query Processing & Ranking

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              SEARCH FLOW                                    │
└─────────────────────────────────────────────────────────────┘

User Query: "best node.js tutorial for beginners"

Step 1: Query Understanding (< 10ms)
├─ Spell check: ✓ No corrections needed
├─ Tokenize: ["best", "node.js", "tutorial", "beginners"]
├─ Remove stop words: ["best", "node.js", "tutorial", "beginners"]
├─ Detect intent: Educational/Learning
└─ Identify query type: Informational

Step 2: Index Lookup (< 50ms)
├─ Query inverted index for each term
├─ "node.js" → 10M documents
├─ "tutorial" → 50M documents
├─ "beginners" → 20M documents
└─ Intersection: ~500K matching documents

Step 3: Ranking (< 100ms)
For each document, calculate score:

Score = w1×PageRank + w2×Relevance + w3×Freshness + w4×UserSignals

PageRank Calculation:
├─ Based on link graph
├─ Quality of backlinks
└─ Authority of linking domains

Relevance Score (TF-IDF):
├─ TF (Term Frequency): How often term appears in doc
├─ IDF (Inverse Document Frequency): Rarity of term
└─ Position: Title > Headings > Body

Freshness:
├─ Publication date
├─ Last update date
└─ Query deserves freshness (QDF)

User Signals:
├─ Click-through rate (CTR)
├─ Dwell time
└─ Bounce rate

Machine Learning:
├─ RankBrain: Handles ambiguous queries
├─ BERT: Understands context and intent
└─ Neural Matching: Semantic understanding

Step 4: Personalization (< 20ms)
├─ User location: Show local results
├─ Search history: Prefer previously clicked domains
├─ Language preference
└─ Device type (mobile/desktop)

Step 5: Result Generation (< 30ms)
├─ Top 10 results selected
├─ Generate snippets
├─ Add rich results (images, videos, knowledge graph)
└─ Related searches

Total Time: ~200ms
\`\`\`

---

## 🧮 Key Algorithms

### 1. PageRank Algorithm

\`\`\`
PageRank Formula:

PR(A) = (1-d) + d × Σ(PR(Ti) / C(Ti))

Where:
- PR(A) = PageRank of page A
- d = Damping factor (usually 0.85)
- Ti = Pages that link to A
- C(Ti) = Number of outbound links from Ti

Example:
┌─────┐     ┌─────┐
│ A   │────▶│ B   │
└─────┘     └─────┘
   ▲           │
   │           │
   │           ▼
┌─────┐     ┌─────┐
│ D   │◀────│ C   │
└─────┘     └─────┘

Initial: PR(A) = PR(B) = PR(C) = PR(D) = 1.0

Iteration 1:
PR(A) = 0.15 + 0.85 × (PR(D)/1) = 0.15 + 0.85 = 1.0
PR(B) = 0.15 + 0.85 × (PR(A)/1) = 0.15 + 0.85 = 1.0
...

Converges after multiple iterations.
\`\`\`

### 2. TF-IDF (Term Frequency - Inverse Document Frequency)

\`\`\`
TF-IDF = TF × IDF

TF (Term Frequency):
TF = (Number of times term appears in document) / (Total terms in document)

IDF (Inverse Document Frequency):
IDF = log(Total documents / Documents containing term)

Example:
Document: "Node.js is a JavaScript runtime. Node.js is fast."
Query: "node.js"

TF = 2/10 = 0.2
IDF = log(1,000,000 / 10,000) = 2.0
TF-IDF = 0.2 × 2.0 = 0.4
\`\`\`

### 3. BM25 (Best Matching 25) - Modern Ranking

\`\`\`
BM25 = Σ IDF(qi) × (f(qi,D) × (k1+1)) / (f(qi,D) + k1×(1-b+b×|D|/avgdl))

Where:
- qi = Query term
- f(qi,D) = Frequency of qi in document D
- |D| = Document length
- avgdl = Average document length
- k1, b = Tuning parameters (usually k1=1.5, b=0.75)
\`\`\`

---

## 📊 Data Structures

### 1. Inverted Index

\`\`\`javascript
// Simplified structure
{
  "node": {
    "docFreq": 10000000,
    "postings": [
      { "docId": 1, "positions": [0, 15, 30], "tf": 3 },
      { "docId": 5, "positions": [2], "tf": 1 },
      { "docId": 100, "positions": [0, 5], "tf": 2 }
    ]
  },
  "tutorial": {
    "docFreq": 50000000,
    "postings": [
      { "docId": 1, "positions": [1], "tf": 1 },
      { "docId": 3, "positions": [0, 10], "tf": 2 }
    ]
  }
}
\`\`\`

### 2. Document Store

\`\`\`javascript
{
  "docId": 1,
  "url": "https://nodejs.org/tutorial",
  "title": "Node.js Tutorial - Official Documentation",
  "content": "Node.js is a JavaScript runtime...",
  "pageRank": 0.85,
  "lastCrawled": "2024-12-20T10:00:00Z",
  "inlinks": 5000,
  "outlinks": 50,
  "language": "en"
}
\`\`\`

### 3. Link Graph

\`\`\`javascript
// Adjacency list representation
{
  "url1": ["url2", "url3", "url5"],
  "url2": ["url1", "url4"],
  "url3": ["url1"],
  "url4": [],
  "url5": ["url1", "url2"]
}
\`\`\`

---

## 🚀 Scalability & Performance

### 1. Distributed Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              GLOBAL DISTRIBUTION                            │
└─────────────────────────────────────────────────────────────┘

Data Centers Worldwide:
├─ North America: 15+ data centers
├─ Europe: 10+ data centers
├─ Asia: 10+ data centers
└─ Others: 5+ data centers

Each Data Center:
├─ Index Servers: 1000s of machines
├─ Query Processors: 100s of machines
├─ Crawlers: 100s of machines
└─ Storage: Petabytes of data
\`\`\`

### 2. Caching Strategy

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              MULTI-LEVEL CACHING                            │
└─────────────────────────────────────────────────────────────┘

Level 1: Browser Cache
├─ Cache search results
└─ TTL: 5-10 minutes

Level 2: CDN Cache (Edge Servers)
├─ Cache popular queries
├─ Geographically distributed
└─ TTL: 1-5 minutes

Level 3: Application Cache (Memcached/Redis)
├─ Cache query results
├─ Cache index lookups
└─ TTL: 30 seconds - 5 minutes

Level 4: Database Cache
├─ Cache frequently accessed documents
└─ In-memory index portions
\`\`\`

### 3. Sharding Strategy

\`\`\`
Index Sharding:

Term-based Sharding:
├─ Shard 1: Terms A-C
├─ Shard 2: Terms D-F
├─ Shard 3: Terms G-I
└─ ...

Document-based Sharding:
├─ Shard 1: Documents 1-1M
├─ Shard 2: Documents 1M-2M
└─ ...

Hybrid Approach (Google uses):
├─ Combine both strategies
└─ Optimize for query patterns
\`\`\`

### 4. Fault Tolerance

\`\`\`
Replication:
├─ Each shard replicated 3x
├─ Primary-Backup model
└─ Automatic failover

Data Consistency:
├─ Eventually consistent
├─ Periodic full re-indexing
└─ Incremental updates
\`\`\`

---

## 🔧 Technologies Used

### Storage:
- **Bigtable**: Distributed storage for web pages
- **Colossus**: Distributed file system
- **Spanner**: Globally distributed database

### Processing:
- **MapReduce**: Distributed data processing
- **Caffeine**: High-performance caching
- **Protocol Buffers**: Data serialization

### Machine Learning:
- **TensorFlow**: ML framework
- **RankBrain**: AI-based ranking
- **BERT**: Natural language understanding

---

## 📈 Performance Metrics

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              PERFORMANCE TARGETS                            │
└─────────────────────────────────────────────────────────────┘

Query Latency:
├─ P50: < 200ms
├─ P95: < 500ms
└─ P99: < 1000ms

Throughput:
├─ 100,000+ queries per second per data center
└─ 8.5 billion queries per day globally

Availability:
├─ 99.99% uptime
└─ < 5 minutes downtime per month

Freshness:
├─ Popular pages: Crawled every few hours
├─ News: Crawled every few minutes
└─ Average page: Crawled every few weeks
\`\`\`

---

## 🎯 Key Takeaways

1. ✅ **Crawling**: Googlebot continuously discovers and downloads web pages
2. ✅ **Indexing**: Pages are processed and stored in inverted index
3. ✅ **Ranking**: PageRank + ML models rank results by relevance
4. ✅ **Serving**: Results delivered in < 500ms with caching
5. ✅ **Scalability**: Distributed across millions of servers globally
6. ✅ **Machine Learning**: RankBrain, BERT for better understanding

---

**Google Search = Crawling + Indexing + Ranking + Serving + ML** 🚀
