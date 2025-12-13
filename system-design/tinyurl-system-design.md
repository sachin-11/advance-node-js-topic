# TinyURL System Design - Complete Guide

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Requirements Gathering](#requirements-gathering)
3. [Capacity Estimation](#capacity-estimation)
4. [High-Level Design](#high-level-design)
5. [Detailed Design](#detailed-design)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Algorithm for URL Shortening](#algorithm-for-url-shortening)
9. [Scalability & Performance](#scalability--performance)
10. [Code Implementation](#code-implementation)

---

## 🎯 Problem Statement

**TinyURL** ek URL shortening service hai jo long URLs ko short, manageable links mein convert karta hai.

**Example:**
- Original URL: `https://www.example.com/very/long/path/to/resource?id=123&category=tech`
- Short URL: `https://tinyurl.com/abc123`

---

## 📝 Requirements Gathering

### Functional Requirements

1. **URL Shortening**
   - Long URL ko short URL mein convert karna
   - Short URL unique honi chahiye
   - Short URL se original URL retrieve karna

2. **URL Redirection**
   - Short URL par click karne par original URL par redirect karna
   - Redirect fast hona chahiye (< 100ms)

3. **Analytics (Optional)**
   - Click count track karna
   - Geographic data collect karna
   - Timestamp tracking

4. **Custom URLs (Optional)**
   - Users ko custom short URLs provide karna
   - Custom URL availability check karna

5. **Expiration (Optional)**
   - URLs ko expire karne ka option
   - TTL (Time To Live) support

### Non-Functional Requirements

1. **Availability**: 99.9% uptime (high availability)
2. **Performance**: 
   - URL shortening: < 100ms
   - URL redirection: < 50ms
3. **Scalability**: 
   - 100M URLs per day handle karna
   - 100:1 read/write ratio (more reads than writes)
4. **Durability**: Data loss nahi hona chahiye
5. **Security**: 
   - Malicious URLs ko block karna
   - Rate limiting
   - HTTPS support

---

## 📊 Capacity Estimation

### Traffic Estimates

**Assumptions:**
- 100 million URLs per day (writes)
- 100:1 read/write ratio
- 10 billion reads per day
- Average URL size: 500 bytes
- Short URL size: 7 characters (base62)

### Storage Estimates

**Per URL:**
- Original URL: 500 bytes
- Short URL: 7 bytes
- Created timestamp: 8 bytes
- Expiration date: 8 bytes
- Total: ~523 bytes per URL

**For 5 years:**
- 100M URLs/day × 365 days × 5 years = 182.5 billion URLs
- Total storage: 182.5B × 523 bytes = ~95 TB

### Bandwidth Estimates

**Write requests:**
- 100M URLs/day = 1,160 URLs/second
- 1,160 × 523 bytes = ~0.6 MB/s

**Read requests:**
- 10B reads/day = 115,740 reads/second
- 115,740 × 523 bytes = ~60 MB/s

### Memory Estimates (Caching)

**80-20 rule:** 20% URLs, 80% traffic
- 20% of 10B = 2B hot URLs
- 2B × 523 bytes = ~1 TB cache

**For 1 day:**
- 100M URLs × 523 bytes = ~52 GB

---

## 🏗️ High-Level Design

### System Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Load Balancer              │
└──────┬──────────────────┬──────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Web Server │    │  Web Server │
│  (API)      │    │  (API)      │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────────┐
│      Application Server Layer       │
│  - URL Shortening Service           │
│  - URL Redirection Service          │
│  - Analytics Service                │
└──────┬──────────────────┬──────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Cache     │    │  Database   │
│  (Redis)    │    │  (NoSQL)    │
└─────────────┘    └─────────────┘
```

### Components

1. **Load Balancer**: Traffic distribute karta hai
2. **Web Servers**: HTTP requests handle karte hain
3. **Application Servers**: Business logic
4. **Database**: URLs store karta hai
5. **Cache**: Frequently accessed URLs ke liye

---

## 🔧 Detailed Design

### 1. URL Shortening Flow

```
User Request (Long URL)
    │
    ▼
Load Balancer
    │
    ▼
Web Server (API)
    │
    ▼
Application Server
    │
    ├─► Check if URL already exists in Cache
    │   │
    │   ├─► If exists: Return existing short URL
    │   │
    │   └─► If not: Continue
    │
    ├─► Generate unique short code
    │   │
    │   ├─► Method 1: Base62 encoding (Counter-based)
    │   ├─► Method 2: Hash-based (MD5/SHA256)
    │   └─► Method 3: Random string generation
    │
    ├─► Check uniqueness in Database
    │   │
    │   ├─► If unique: Store in DB
    │   └─► If not: Retry with different code
    │
    ├─► Store in Cache (for fast retrieval)
    │
    └─► Return short URL to user
```

### 2. URL Redirection Flow

```
User clicks Short URL
    │
    ▼
Load Balancer
    │
    ▼
Web Server
    │
    ▼
Application Server
    │
    ├─► Check Cache first
    │   │
    │   ├─► If found: Return 301/302 redirect
    │   │
    │   └─► If not: Check Database
    │       │
    │       ├─► If found:
    │       │   ├─► Store in Cache
    │       │   ├─► Update analytics (async)
    │       │   └─► Return 301/302 redirect
    │       │
    │       └─► If not found: Return 404
```

### 3. Database Schema Design

#### Option 1: SQL Database (MySQL/PostgreSQL)

```sql
CREATE TABLE urls (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(7) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    user_id BIGINT NULL,
    click_count BIGINT DEFAULT 0,
    INDEX idx_short_code (short_code),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(7) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    INDEX idx_short_code (short_code),
    INDEX idx_clicked_at (clicked_at)
);
```

#### Option 2: NoSQL Database (Cassandra/DynamoDB)

**Partition Key Strategy:**
- Short code ko partition key banaya
- High read throughput ke liye optimized

```json
{
  "short_code": "abc123",
  "original_url": "https://www.example.com/very/long/path",
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": null,
  "user_id": "user123",
  "click_count": 1523
}
```

### 4. Caching Strategy

**Cache Layer (Redis):**

1. **Write-through Cache:**
   - URL shorten karte time cache mein store karo
   - TTL: 1 day (hot URLs ke liye)

2. **Read-through Cache:**
   - Redirect request par pehle cache check karo
   - Cache miss par database se fetch karo aur cache mein store karo

3. **Cache Eviction:**
   - LRU (Least Recently Used) policy
   - Memory limit: 80% of available RAM

---

## 🔑 Algorithm for URL Shortening

### Method 1: Base62 Encoding (Counter-based) ⭐ Recommended

**Advantages:**
- Predictable, sequential
- No collisions
- Easy to implement

**How it works:**
1. Auto-incrementing counter use karo
2. Counter ko Base62 mein convert karo
3. 7 characters = 62^7 = 3.5 trillion unique URLs

```javascript
// Base62 Characters: 0-9, a-z, A-Z
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(num) {
    if (num === 0) return BASE62[0];
    
    let result = '';
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result.padStart(7, '0'); // Ensure 7 characters
}

function decodeBase62(shortCode) {
    let num = 0;
    for (let i = 0; i < shortCode.length; i++) {
        num = num * 62 + BASE62.indexOf(shortCode[i]);
    }
    return num;
}
```

**Counter Management:**
- Single counter service (Zookeeper/etcd)
- Range-based allocation (1000 IDs per server)
- Pre-allocate ranges to avoid contention

### Method 2: Hash-based (MD5/SHA256)

**Advantages:**
- No central counter needed
- Distributed friendly

**Disadvantages:**
- Collisions possible (handle karna padega)
- Not sequential

```javascript
const crypto = require('crypto');

function generateShortUrl(longUrl) {
    // Hash the long URL
    const hash = crypto.createHash('md5').update(longUrl).digest('hex');
    
    // Take first 7 characters
    let shortCode = hash.substring(0, 7);
    
    // Check for collision and handle
    // If collision, append counter or use different hash
    
    return shortCode;
}
```

### Method 3: Random String Generation

**Advantages:**
- Simple
- No collisions (if long enough)

**Disadvantages:**
- Collision checking required
- Not URL-friendly (might need retries)

```javascript
function generateRandomString(length = 7) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
```

---

## 🚀 Scalability & Performance

### 1. Database Scaling

**Read Replicas:**
- Master-Slave setup
- Reads: Slaves se
- Writes: Master par

**Sharding Strategy:**
- Short code ke first character ke basis par shard
- 62 shards (0-9, a-z, A-Z)
- Consistent hashing use karo

**Partitioning:**
```
Shard 0: URLs starting with 0-9
Shard 1: URLs starting with a-f
Shard 2: URLs starting with g-m
...
```

### 2. Caching Strategy

**Multi-level Caching:**
1. **L1 Cache**: Application server memory (local cache)
2. **L2 Cache**: Redis cluster (distributed cache)
3. **CDN**: Static assets ke liye

**Cache Warming:**
- Popular URLs ko proactively cache karo
- Analytics data se identify karo

### 3. Load Balancing

**Strategies:**
- Round-robin
- Least connections
- Geographic distribution

**Health Checks:**
- Regular health check endpoints
- Automatic failover

### 4. Rate Limiting

**Per User:**
- 100 URLs per hour per IP
- Token bucket algorithm

**Per Service:**
- Global rate limits
- Distributed rate limiting (Redis)

---

## 💻 Code Implementation

### Node.js/Express Implementation

```javascript
// server.js
const express = require('express');
const redis = require('redis');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Redis Client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

// MongoDB Client
const mongoClient = new MongoClient(process.env.MONGODB_URI);
const db = mongoClient.db('tinyurl');
const urlsCollection = db.collection('urls');

// Base62 Encoding
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(num) {
    if (num === 0) return BASE62[0];
    let result = '';
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result.padStart(7, '0');
}

// Generate unique short code using counter
async function generateShortCode() {
    // In production, use distributed counter (Zookeeper, etcd, or database)
    // For demo, using simple counter
    const counterDoc = await db.collection('counters').findOneAndUpdate(
        { _id: 'url_counter' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    return encodeBase62(counterDoc.seq);
}

// POST /api/shorten - Create short URL
app.post('/api/shorten', async (req, res) => {
    try {
        const { longUrl, customCode, expiresIn } = req.body;
        
        // Validate URL
        try {
            new URL(longUrl);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL' });
        }
        
        // Check if custom code provided
        let shortCode = customCode;
        
        if (!shortCode) {
            // Generate unique short code
            shortCode = await generateShortCode();
        } else {
            // Check if custom code already exists
            const existing = await urlsCollection.findOne({ short_code: shortCode });
            if (existing) {
                return res.status(409).json({ error: 'Custom code already exists' });
            }
        }
        
        // Calculate expiration
        const expiresAt = expiresIn 
            ? new Date(Date.now() + expiresIn * 1000)
            : null;
        
        // Store in database
        const urlDoc = {
            short_code: shortCode,
            original_url: longUrl,
            created_at: new Date(),
            expires_at: expiresAt,
            click_count: 0
        };
        
        await urlsCollection.insertOne(urlDoc);
        
        // Store in cache (TTL: 1 day)
        await redisClient.setEx(
            `url:${shortCode}`,
            86400, // 1 day
            longUrl
        );
        
        const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`;
        
        res.json({
            shortUrl,
            shortCode,
            longUrl,
            expiresAt
        });
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        // Check cache first
        const cachedUrl = await redisClient.get(`url:${shortCode}`);
        if (cachedUrl) {
            // Update click count asynchronously
            updateClickCount(shortCode).catch(console.error);
            return res.redirect(301, cachedUrl);
        }
        
        // Check database
        const urlDoc = await urlsCollection.findOne({ short_code: shortCode });
        
        if (!urlDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }
        
        // Check expiration
        if (urlDoc.expires_at && new Date() > urlDoc.expires_at) {
            return res.status(410).json({ error: 'URL has expired' });
        }
        
        // Store in cache
        await redisClient.setEx(
            `url:${shortCode}`,
            86400,
            urlDoc.original_url
        );
        
        // Update click count
        await updateClickCount(shortCode);
        
        // Redirect
        res.redirect(301, urlDoc.original_url);
        
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update click count
async function updateClickCount(shortCode) {
    await urlsCollection.updateOne(
        { short_code: shortCode },
        { $inc: { click_count: 1 } }
    );
}

// GET /api/stats/:shortCode - Get URL statistics
app.get('/api/stats/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        const urlDoc = await urlsCollection.findOne(
            { short_code: shortCode },
            { projection: { original_url: 0 } } // Don't return original URL
        );
        
        if (!urlDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }
        
        res.json({
            shortCode: urlDoc.short_code,
            clickCount: urlDoc.click_count,
            createdAt: urlDoc.created_at,
            expiresAt: urlDoc.expires_at
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour
    message: 'Too many requests, please try again later'
});

app.use('/api/shorten', limiter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Python/Flask Implementation

```python
# app.py
from flask import Flask, request, jsonify, redirect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
import pymongo
from datetime import datetime, timedelta
import hashlib

app = Flask(__name__)

# Redis connection
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

# MongoDB connection
mongo_client = pymongo.MongoClient('mongodb://localhost:27017/')
db = mongo_client['tinyurl']
urls_collection = db['urls']

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(num):
    if num == 0:
        return BASE62[0]
    result = ''
    while num > 0:
        result = BASE62[num % 62] + result
        num //= 62
    return result.zfill(7)

def generate_short_code():
    counter_doc = urls_collection.find_one_and_update(
        {'_id': 'url_counter'},
        {'$inc': {'seq': 1}},
        upsert=True,
        return_document=pymongo.ReturnDocument.AFTER
    )
    return encode_base62(counter_doc['seq'])

@app.route('/api/shorten', methods=['POST'])
@limiter.limit("100 per hour")
def shorten_url():
    data = request.json
    long_url = data.get('longUrl')
    custom_code = data.get('customCode')
    expires_in = data.get('expiresIn')  # in seconds
    
    # Validate URL
    if not long_url or not long_url.startswith(('http://', 'https://')):
        return jsonify({'error': 'Invalid URL'}), 400
    
    # Generate or use custom code
    if custom_code:
        if urls_collection.find_one({'short_code': custom_code}):
            return jsonify({'error': 'Custom code already exists'}), 409
        short_code = custom_code
    else:
        short_code = generate_short_code()
    
    # Calculate expiration
    expires_at = None
    if expires_in:
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    
    # Store in database
    url_doc = {
        'short_code': short_code,
        'original_url': long_url,
        'created_at': datetime.utcnow(),
        'expires_at': expires_at,
        'click_count': 0
    }
    urls_collection.insert_one(url_doc)
    
    # Store in cache
    redis_client.setex(
        f'url:{short_code}',
        86400,  # 1 day
        long_url
    )
    
    short_url = f"{request.host_url}{short_code}"
    
    return jsonify({
        'shortUrl': short_url,
        'shortCode': short_code,
        'longUrl': long_url,
        'expiresAt': expires_at.isoformat() if expires_at else None
    }), 201

@app.route('/<short_code>', methods=['GET'])
def redirect_url(short_code):
    # Check cache
    cached_url = redis_client.get(f'url:{short_code}')
    if cached_url:
        # Update click count asynchronously
        update_click_count(short_code)
        return redirect(cached_url, code=301)
    
    # Check database
    url_doc = urls_collection.find_one({'short_code': short_code})
    if not url_doc:
        return jsonify({'error': 'URL not found'}), 404
    
    # Check expiration
    if url_doc.get('expires_at') and datetime.utcnow() > url_doc['expires_at']:
        return jsonify({'error': 'URL has expired'}), 410
    
    # Store in cache
    redis_client.setex(
        f'url:{short_code}',
        86400,
        url_doc['original_url']
    )
    
    # Update click count
    update_click_count(short_code)
    
    return redirect(url_doc['original_url'], code=301)

def update_click_count(short_code):
    urls_collection.update_one(
        {'short_code': short_code},
        {'$inc': {'click_count': 1}}
    )

@app.route('/api/stats/<short_code>', methods=['GET'])
def get_stats(short_code):
    url_doc = urls_collection.find_one(
        {'short_code': short_code},
        {'original_url': 0}
    )
    if not url_doc:
        return jsonify({'error': 'URL not found'}), 404
    
    return jsonify({
        'shortCode': url_doc['short_code'],
        'clickCount': url_doc['click_count'],
        'createdAt': url_doc['created_at'].isoformat(),
        'expiresAt': url_doc.get('expires_at').isoformat() if url_doc.get('expires_at') else None
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## 📈 Monitoring & Analytics

### Key Metrics

1. **Performance Metrics:**
   - Response time (p50, p95, p99)
   - Throughput (requests/second)
   - Error rate

2. **Business Metrics:**
   - URLs created per day
   - Click-through rate
   - Active users

3. **System Metrics:**
   - CPU, Memory usage
   - Database connection pool
   - Cache hit rate

### Tools

- **APM**: New Relic, Datadog
- **Logging**: ELK Stack, Splunk
- **Monitoring**: Prometheus + Grafana

---

## 🔒 Security Considerations

1. **Input Validation:**
   - URL format validation
   - Malicious URL detection
   - XSS prevention

2. **Rate Limiting:**
   - Per IP limits
   - Per user limits
   - Distributed rate limiting

3. **Authentication:**
   - API keys for premium users
   - OAuth for user accounts

4. **HTTPS:**
   - All traffic encrypted
   - SSL/TLS certificates

---

## 🎓 Interview Tips

### Common Questions

1. **How to handle collisions?**
   - Retry with different code
   - Append counter
   - Use longer codes

2. **How to scale to billions?**
   - Database sharding
   - Caching strategy
   - CDN for static content
   - Read replicas

3. **How to handle expired URLs?**
   - Background job to delete expired URLs
   - Lazy deletion (check on access)
   - Separate expired URLs table

4. **How to prevent abuse?**
   - Rate limiting
   - URL validation
   - Blacklist malicious domains
   - CAPTCHA for suspicious activity

---

## 📚 Additional Resources

- **System Design Primer**: https://github.com/donnemartin/system-design-primer
- **Base62 Encoding**: https://en.wikipedia.org/wiki/Base62
- **Consistent Hashing**: https://en.wikipedia.org/wiki/Consistent_hashing

---

## ✅ Summary

**Key Takeaways:**
1. ✅ Requirements clearly define karo
2. ✅ Capacity estimation karo (traffic, storage, bandwidth)
3. ✅ High-level architecture design karo
4. ✅ Detailed design with database schema
5. ✅ Scalability considerations (sharding, caching)
6. ✅ Security aur performance optimize karo
7. ✅ Code implementation with best practices

**Production Ready Features:**
- ✅ Distributed counter for unique IDs
- ✅ Multi-level caching
- ✅ Database sharding
- ✅ Rate limiting
- ✅ Analytics tracking
- ✅ URL expiration
- ✅ Custom URLs

---

*Document created for interview preparation and system design practice*

