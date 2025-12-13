# Pastebin System Design - Complete Guide

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Requirements Gathering](#requirements-gathering)
3. [Capacity Estimation](#capacity-estimation)
4. [High-Level Design](#high-level-design)
5. [Detailed Design](#detailed-design)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Algorithm for Paste ID Generation](#algorithm-for-paste-id-generation)
9. [Scalability & Performance](#scalability--performance)
10. [Security Considerations](#security-considerations)

---

## 🎯 Problem Statement

**Pastebin** ek text/code sharing service hai jo users ko temporary ya permanent text snippets share karne ki facility deta hai. Users apna code, text, ya koi bhi content paste kar sakte hain aur ek unique link share kar sakte hain.

**Use Cases:**
- Developers code snippets share karte hain
- Error logs share karte hain debugging ke liye
- Configuration files share karte hain
- Long text messages share karte hain
- Code collaboration aur code review
- Temporary file storage

**Example:**
- User paste karta hai: Python code snippet
- System generate karta hai: `https://pastebin.com/abc123`
- User share karta hai link, aur koi bhi dekh sakta hai syntax highlighted code

---

## 📝 Requirements Gathering

### Functional Requirements

#### 1. **Paste Creation**
   - Text/code paste create karna
   - Unique paste ID generate karna
   - Custom paste ID option (optional)
   - Paste title set karna (optional)
   - Language/syntax selection
   - File upload support (images, documents)

#### 2. **Paste Viewing**
   - Paste ID se paste retrieve karna
   - Syntax highlighting (multiple languages)
   - Raw text view option
   - Download paste as file
   - Print-friendly view

#### 3. **Expiration Management**
   - Time-based expiration (1 hour, 1 day, 1 week, 1 month, never)
   - View-based expiration (after N views)
   - Automatic cleanup of expired pastes

#### 4. **Privacy & Access Control**
   - Public pastes (anyone with link can view)
   - Private pastes (only creator can view)
   - Unlisted pastes (not in public listing, but accessible via link)
   - Password protection
   - Burn after reading (one-time view)

#### 5. **User Accounts**
   - User registration/login
   - User dashboard
   - Paste history
   - Collections/Folders
   - Favorite pastes
   - User profile management

#### 6. **Advanced Features**
   - Paste editing (if not expired)
   - Fork/Clone paste
   - Paste versioning
   - Paste diff view
   - Multiple file support in one paste
   - Paste comments (if public)

#### 7. **Analytics**
   - View count tracking
   - Geographic data collection
   - Referrer tracking
   - Popular pastes
   - Trending languages
   - User statistics

#### 8. **File Uploads**
   - Image uploads (PNG, JPG, GIF)
   - Document uploads (PDF, DOCX)
   - File size limits
   - File type validation
   - Virus scanning

### Non-Functional Requirements

1. **Availability**: 99.9% uptime (high availability)
2. **Performance**: 
   - Paste creation: < 200ms
   - Paste retrieval: < 100ms (with cache)
   - Syntax highlighting: < 500ms
   - File upload: Support chunked uploads
3. **Scalability**: 
   - 50M pastes per day handle karna
   - 10:1 read/write ratio
   - Support millions of concurrent users
4. **Durability**: 
   - Data loss nahi hona chahiye
   - Backup aur replication
5. **Security**: 
   - Password encryption
   - XSS prevention
   - CSRF protection
   - Rate limiting
   - Input validation
   - File upload security
6. **Storage**: 
   - Efficient storage for text (small) and files (large)
   - CDN integration for file serving
   - Archive old pastes

---

## 📊 Capacity Estimation

### Traffic Estimates

**Assumptions:**
- 50 million pastes per day (writes)
- 10:1 read/write ratio
- 500 million reads per day
- Average paste size: 5 KB (text)
- Average file size: 500 KB (if file attached)
- 20% of pastes have files attached

### Storage Estimates

**Per Paste (Text Only):**
- Paste content: 5 KB average
- Metadata (ID, title, language, timestamps, etc.): 500 bytes
- Total: ~5.5 KB per paste

**Per Paste (With File):**
- Paste content: 5 KB
- File: 500 KB average
- Metadata: 500 bytes
- Total: ~505.5 KB per paste

**For 5 years:**
- 50M pastes/day × 365 days × 5 years = 91.25 billion pastes
- Text only (80%): 91.25B × 0.8 × 5.5 KB = ~400 TB
- With files (20%): 91.25B × 0.2 × 505.5 KB = ~9.2 PB
- **Total storage: ~9.6 PB**

### Bandwidth Estimates

**Write requests:**
- 50M pastes/day = 579 pastes/second
- Average: 579 × 5.5 KB = ~3.2 MB/s (text only)
- With files: 579 × 0.2 × 505.5 KB = ~58.5 MB/s
- **Total write bandwidth: ~62 MB/s**

**Read requests:**
- 500M reads/day = 5,787 reads/second
- Average: 5,787 × 5.5 KB = ~32 MB/s (text)
- With files: 5,787 × 0.2 × 505.5 KB = ~585 MB/s
- **Total read bandwidth: ~617 MB/s**

### Server Requirements

**Application Servers:**
- Write QPS: 579/second
- Read QPS: 5,787/second
- Each server can handle: ~1,000 QPS
- **Need: ~6-8 application servers**

**Database:**
- Write: 579 writes/second
- Read: 5,787 reads/second (mostly from cache)
- Database reads: ~578/second (90% cache hit rate)
- **Need: Master-Slave setup with read replicas**

**Cache:**
- Hot pastes: Top 10% = 5M pastes
- Average size: 5.5 KB
- **Cache size needed: ~27.5 GB**

---

## 🏗️ High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  (Web Browser, Mobile App, API Clients)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Load Balancer                             │
│            (Nginx/HAProxy/AWS ELB)                         │
└───────────┬───────────────────────────────┬────────────────┘
            │                               │
            │ Round-robin / Least-conn      │
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Web Server 1       │      │   Web Server 2       │
│   (Express/Node.js)  │      │   (Express/Node.js)  │
└──────────┬───────────┘      └──────────┬───────────┘
            │                             │
            └──────────────┬───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Server Layer                       │
│                                                             │
│  - Paste Creation Service                                   │
│  - Paste Retrieval Service                                  │
│  - Syntax Highlighting Service                             │
│  - File Upload Service                                     │
│  - User Authentication Service                             │
│  - Analytics Service                                        │
│  - Expiration Cleanup Service                              │
└───────────┬───────────────────────────────┬────────────────┘
            │                               │
            │                               │
    ┌───────┴───────┐           ┌──────────┴──────────┐
    │               │           │                     │
    ▼               ▼           ▼                     ▼
┌─────────┐  ┌─────────┐  ┌──────────┐      ┌──────────────┐
│  Redis  │  │PostgreSQL│  │Object    │      │   CDN        │
│  Cache  │  │Database  │  │Storage   │      │  (CloudFront)│
│         │  │          │  │(S3-like) │      │              │
│ Hot     │  │Metadata  │  │Files     │      │Static Files  │
│ Pastes  │  │Users     │  │Images    │      │Cached Content│
│         │  │Analytics │  │Docs      │      │              │
└─────────┘  └─────────┘  └──────────┘      └──────────────┘
```

### Components

1. **Load Balancer**
   - Traffic distribute karta hai multiple servers mein
   - Health checks
   - SSL termination

2. **Web Servers**
   - HTTP requests handle karte hain
   - Static content serve karte hain
   - API endpoints expose karte hain

3. **Application Servers**
   - Business logic
   - Paste creation/retrieval
   - Syntax highlighting
   - File processing
   - User authentication

4. **Database (PostgreSQL)**
   - Paste metadata
   - User accounts
   - Analytics data
   - Small text pastes (if < 64KB)

5. **Object Storage (S3-like)**
   - Large paste content (> 64KB)
   - File uploads (images, documents)
   - Archive storage

6. **Cache (Redis)**
   - Hot pastes
   - User sessions
   - Rate limiting data
   - Popular pastes

7. **CDN**
   - Static file serving
   - Cached paste content
   - Global distribution

---

## 🔧 Detailed Design

### 1. Paste Creation Flow

```
User Request (POST /api/paste)
    │
    ▼
1. Validate Input
   ├─ Check paste content (not empty)
   ├─ Check file size limits
   ├─ Validate file type (if file uploaded)
   └─ Check rate limits
    │
    ▼
2. Generate Paste ID
   ├─ Check if custom ID provided
   ├─ If custom: Validate uniqueness
   └─ If not: Generate using Base62 (like TinyURL)
    │
    ▼
3. Process Content
   ├─ Detect language (if not specified)
   ├─ Sanitize content (XSS prevention)
   ├─ If file: Upload to object storage
   └─ If text > 64KB: Store in object storage
    │
    ▼
4. Store Metadata in Database
   ├─ Paste ID, title, language
   ├─ User ID (if logged in)
   ├─ Privacy settings
   ├─ Expiration settings
   ├─ File URL (if file attached)
   └─ Content location (DB or object storage)
    │
    ▼
5. Cache Hot Paste
   ├─ Store in Redis (if likely to be popular)
   └─ Set TTL based on expiration
    │
    ▼
6. Return Response
   └─ Paste URL, ID, expiration info
```

### 2. Paste Retrieval Flow

```
User Request (GET /paste/:id)
    │
    ▼
1. Validate Paste ID
   ├─ Check format
   └─ Rate limiting
    │
    ▼
2. Check Access Control
   ├─ If private: Check user authentication
   ├─ If password protected: Verify password
   ├─ If burn after reading: Check if already viewed
   └─ If expired: Return 404
    │
    ▼
3. Retrieve from Cache (Redis)
   ├─ Cache HIT: Return cached paste
   └─ Cache MISS: Continue to database
    │
    ▼
4. Retrieve from Database
   ├─ Get metadata
   ├─ Get content location (DB or object storage)
   └─ If in object storage: Fetch from S3
    │
    ▼
5. Apply Syntax Highlighting
   ├─ Detect language
   ├─ Apply highlighting library (Pygments/Highlight.js)
   └─ Generate HTML
    │
    ▼
6. Update Analytics
   ├─ Increment view count (async)
   ├─ Track geographic data (async)
   └─ Track referrer (async)
    │
    ▼
7. Cache Result
   ├─ Store in Redis
   └─ Set appropriate TTL
    │
    ▼
8. Return Response
   └─ HTML with syntax highlighting or raw text
```

### 3. Syntax Highlighting Flow

```
Paste Content
    │
    ▼
1. Language Detection
   ├─ User specified language
   ├─ Auto-detect from content
   └─ Fallback to plain text
    │
    ▼
2. Highlighting Engine
   ├─ Server-side: Pygments (Python)
   ├─ Client-side: Highlight.js (JavaScript)
   └─ Hybrid: Pre-render on server, enhance on client
    │
    ▼
3. Generate HTML
   ├─ Apply syntax highlighting
   ├─ Add line numbers (optional)
   └─ Apply theme/CSS
    │
    ▼
4. Cache Highlighted HTML
   ├─ Store in Redis/CDN
   └─ Reuse for future requests
```

### 4. File Upload Flow

```
User Uploads File
    │
    ▼
1. Validate File
   ├─ Check file size (< 10MB for free users)
   ├─ Check file type (whitelist)
   ├─ Virus scan (optional)
   └─ Rate limiting
    │
    ▼
2. Generate Unique Filename
   ├─ UUID-based filename
   └─ Preserve extension
    │
    ▼
3. Upload to Object Storage
   ├─ Multipart upload (if > 5MB)
   ├─ Chunked upload (if > 100MB)
   └─ Store in S3-like storage
    │
    ▼
4. Store Metadata
   ├─ File URL in database
   ├─ File size, type
   └─ Upload timestamp
    │
    ▼
5. CDN Integration
   ├─ Invalidate CDN cache
   └─ Serve via CDN for fast access
```

### 5. Expiration Cleanup Flow

```
Scheduled Job (Every Hour)
    │
    ▼
1. Find Expired Pastes
   ├─ Time-based: WHERE expires_at < NOW()
   ├─ View-based: WHERE views >= max_views
   └─ Batch query (1000 at a time)
    │
    ▼
2. Delete Files from Object Storage
   ├─ Get file URLs
   └─ Delete from S3
    │
    ▼
3. Delete from Database
   ├─ Delete paste records
   ├─ Delete analytics records
   └─ Delete from cache
    │
    ▼
4. Archive (Optional)
   ├─ Move to archive storage (cheaper)
   └─ Keep for compliance/legal reasons
```

### 6. User Authentication Flow

```
User Login Request
    │
    ▼
1. Validate Credentials
   ├─ Check username/email
   ├─ Verify password (bcrypt)
   └─ Check account status
    │
    ▼
2. Generate Session Token
   ├─ JWT token creation
   ├─ Set expiration (7 days)
   └─ Include user ID, permissions
    │
    ▼
3. Store Session
   ├─ Store in Redis
   └─ Set TTL
    │
    ▼
4. Return Token
   └─ Set HTTP-only cookie or return in response
```

---

## 🗄️ Database Design

### Tables

#### 1. `pastes` Table

```sql
CREATE TABLE pastes (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,  -- For small pastes (< 64KB)
    content_location VARCHAR(10) DEFAULT 'db',  -- 'db' or 's3'
    content_url TEXT,  -- S3 URL if stored in object storage
    language VARCHAR(50),
    user_id BIGINT REFERENCES users(id),
    privacy VARCHAR(20) DEFAULT 'public',  -- 'public', 'private', 'unlisted'
    password_hash VARCHAR(255),  -- If password protected
    expires_at TIMESTAMP,
    max_views INTEGER,  -- View-based expiration
    view_count INTEGER DEFAULT 0,
    burn_after_reading BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_paste_id (paste_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_privacy (privacy),
    INDEX idx_created_at (created_at)
);
```

#### 2. `users` Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

#### 3. `files` Table

```sql
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id),
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,  -- S3 URL
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_paste_id (paste_id)
);
```

#### 4. `analytics` Table

```sql
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id),
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_paste_id (paste_id),
    INDEX idx_last_viewed_at (last_viewed_at)
);
```

#### 5. `view_logs` Table (For detailed analytics)

```sql
CREATE TABLE view_logs (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_paste_id (paste_id),
    INDEX idx_viewed_at (viewed_at)
) PARTITION BY RANGE (viewed_at);  -- Partition by date for performance
```

#### 6. `collections` Table (User folders)

```sql
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

#### 7. `collection_pastes` Table (Many-to-many)

```sql
CREATE TABLE collection_pastes (
    collection_id BIGINT REFERENCES collections(id),
    paste_id VARCHAR(20) REFERENCES pastes(paste_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, paste_id),
    INDEX idx_paste_id (paste_id)
);
```

### Storage Strategy

**Small Pastes (< 64KB):**
- Store directly in PostgreSQL `content` column
- Fast retrieval
- No external dependency

**Large Pastes (> 64KB):**
- Store in object storage (S3)
- Store S3 URL in database
- Serve via CDN

**Files:**
- Always store in object storage
- Reference in `files` table
- Serve via CDN

---

## 🔌 API Design

### RESTful Endpoints

#### Paste Management

**POST /api/paste**
Create a new paste

Request:
```json
{
  "content": "print('Hello World')",
  "title": "My Python Code",
  "language": "python",
  "privacy": "public",
  "expires_in": 3600,
  "password": "optional_password",
  "burn_after_reading": false
}
```

Response:
```json
{
  "paste_id": "abc123",
  "url": "https://pastebin.com/abc123",
  "expires_at": "2024-12-08T12:00:00Z",
  "created_at": "2024-12-07T12:00:00Z"
}
```

**GET /api/paste/:id**
Get paste by ID

Response:
```json
{
  "paste_id": "abc123",
  "title": "My Python Code",
  "content": "print('Hello World')",
  "language": "python",
  "created_at": "2024-12-07T12:00:00Z",
  "expires_at": "2024-12-08T12:00:00Z",
  "view_count": 42,
  "privacy": "public"
}
```

**GET /paste/:id/raw**
Get raw paste content (no HTML)

**PUT /api/paste/:id**
Update paste (if not expired and user owns it)

**DELETE /api/paste/:id**
Delete paste

#### File Upload

**POST /api/paste/:id/file**
Upload file to existing paste

Request: Multipart form data
- `file`: File to upload
- `description`: Optional description

Response:
```json
{
  "file_id": "xyz789",
  "filename": "image.png",
  "file_url": "https://cdn.pastebin.com/files/xyz789.png",
  "file_size": 1024000
}
```

#### User Management

**POST /api/auth/register**
Register new user

**POST /api/auth/login**
Login user

**GET /api/user/pastes**
Get user's pastes

**GET /api/user/collections**
Get user's collections

#### Analytics

**GET /api/paste/:id/stats**
Get paste statistics

Response:
```json
{
  "view_count": 1000,
  "unique_views": 850,
  "countries": {
    "US": 400,
    "IN": 300,
    "UK": 150
  },
  "referrers": {
    "google.com": 200,
    "github.com": 100
  }
}
```

---

## 🔑 Algorithm for Paste ID Generation

### Approach 1: Base62 Encoding (Same as TinyURL)

**Algorithm:**
1. Use database auto-increment ID
2. Encode to Base62
3. Result: Short, unique paste ID

**Example:**
- ID 1 → "1"
- ID 62 → "10"
- ID 123 → "1Z"

**Advantages:**
- Guaranteed unique
- Short codes
- Sequential (predictable)

**Implementation:**
```typescript
function generatePasteId(): string {
  // Insert row to get auto-increment ID
  const result = await db.query(
    'INSERT INTO pastes (paste_id) VALUES (\'\') RETURNING id'
  );
  const id = result.rows[0].id;
  
  // Encode to Base62
  return encodeBase62(id);
}
```

### Approach 2: Random String

**Algorithm:**
1. Generate random alphanumeric string
2. Check uniqueness
3. Retry if collision

**Example:**
- "aB3xY9"
- "mK7pQ2"

**Advantages:**
- Non-sequential (harder to guess)
- Can use shorter codes

**Disadvantages:**
- Collision checking needed
- Slower

### Approach 3: Hash-Based

**Algorithm:**
1. Hash paste content (SHA256)
2. Take first 8 characters
3. Check uniqueness, append if needed

**Advantages:**
- Same content = same ID (deduplication)
- Deterministic

**Disadvantages:**
- Collisions possible
- Not user-friendly

### Recommended: Base62 (Approach 1)

Same approach as TinyURL - simple, reliable, scalable.

---

## ⚡ Scalability & Performance

### Caching Strategy

**Multi-Level Caching:**

1. **L1: Application Memory Cache**
   - Hot pastes (top 1%)
   - Size: 100MB per server
   - TTL: 5 minutes

2. **L2: Redis Cache**
   - Popular pastes (top 10%)
   - Size: 50GB total
   - TTL: 1 hour (or until expiration)

3. **L3: CDN Cache**
   - Static files
   - Highlighted HTML (if pre-rendered)
   - TTL: 24 hours

4. **L4: Database**
   - All pastes
   - Fallback if cache miss

### Database Optimization

**Indexing:**
- Index on `paste_id` (primary lookup)
- Index on `user_id` (user queries)
- Index on `expires_at` (cleanup queries)
- Index on `created_at` (popular pastes)

**Partitioning:**
- Partition `view_logs` by date (monthly)
- Archive old partitions

**Read Replicas:**
- Master for writes
- 3 read replicas for reads
- Read from replicas for analytics

### Object Storage Optimization

**CDN Integration:**
- All files served via CDN
- Global edge locations
- Cache headers optimization

**Storage Tiering:**
- Hot storage: Recent pastes (< 30 days)
- Warm storage: Older pastes (30-365 days)
- Cold storage: Archived pastes (> 1 year)

### Load Balancing

**Application Servers:**
- Round-robin or least-connections
- Health checks every 30 seconds
- Auto-scaling based on CPU/memory

**Database:**
- Connection pooling
- Read/write splitting
- Query optimization

---

## 🔒 Security Considerations

### 1. Password Protection

**Implementation:**
- Hash passwords using bcrypt
- Store hash in database
- Verify on paste access

```typescript
// Store password hash
const passwordHash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, passwordHash);
```

### 2. Private Paste Access Control

**Implementation:**
- Check user authentication
- Verify paste ownership
- Return 403 if unauthorized

### 3. XSS Prevention

**Implementation:**
- Sanitize all user input
- Escape HTML characters
- Use Content Security Policy (CSP)
- Validate and sanitize paste content

### 4. CSRF Protection

**Implementation:**
- CSRF tokens for state-changing operations
- SameSite cookies
- Origin validation

### 5. Rate Limiting

**Implementation:**
- Per IP: 100 pastes/hour
- Per user: 1000 pastes/day (if logged in)
- Per endpoint: Different limits
- Redis-based token bucket 

### 6. File Upload Security

**Implementation:**
- File type validation (whitelist)
- File size limits
- Virus scanning (ClamAV)
- Store files outside web root
- Serve via CDN with signed URLs

### 7. Input Validation

**Implementation:**
- Validate paste size (< 10MB for free users)
- Validate language selection
- Validate expiration settings
- Sanitize file names

### 8. Encryption

**Implementation:**
- Encrypt password-protected paste content
- Use AES-256 encryption
- Store encryption key securely (AWS KMS)

---

## 📈 Monitoring & Analytics

### Key Metrics

1. **Performance Metrics**
   - Paste creation latency (p50, p95, p99)
   - Paste retrieval latency
   - Cache hit rate
   - Database query time

2. **Business Metrics**
   - Pastes created per day
   - Unique users per day
   - Popular languages
   - Expiration rate

3. **System Metrics**
   - CPU/Memory usage
   - Database connections
   - Cache memory usage
   - CDN bandwidth

### Alerting

- High error rate (> 1%)
- High latency (p95 > 500ms)
- Database connection pool exhaustion
- Cache hit rate < 80%
- Storage usage > 90%

---

## 🎯 Summary

### Key Design Decisions

1. **Storage**: PostgreSQL for metadata, Object Storage for large content
2. **Caching**: Multi-level (Memory → Redis → CDN → Database)
3. **ID Generation**: Base62 encoding (same as TinyURL)
4. **Syntax Highlighting**: Hybrid (server-side pre-render, client-side enhance)
5. **File Storage**: Object Storage + CDN
6. **Scalability**: Horizontal scaling with load balancer
7. **Security**: Multiple layers (encryption, validation, rate limiting)

### Scalability Numbers

- **50M pastes/day** (writes)
- **500M reads/day**
- **~9.6 PB storage** (5 years)
- **~617 MB/s read bandwidth**
- **6-8 application servers**
- **Master-Slave database** with read replicas

### Technology Stack

- **Backend**: Node.js/Express (TypeScript)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Object Storage**: AWS S3 / MinIO
- **CDN**: CloudFront / Cloudflare
- **Load Balancer**: Nginx / HAProxy
- **Syntax Highlighting**: Highlight.js / Pygments

---

*Complete system design for Pastebin service - ready for implementation!*

