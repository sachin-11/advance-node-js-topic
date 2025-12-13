# Pastebin Storage Design - Complete Architecture

## 📋 Table of Contents
1. [Database Schema](#database-schema)
2. [File Storage Design](#file-storage-design)
3. [Caching Strategy](#caching-strategy)
4. [Data Partitioning](#data-partitioning)
5. [Backup & Recovery](#backup--recovery)
6. [Storage Optimization](#storage-optimization)

---

## 🗄️ Database Schema

### Complete SQL Schema

#### 1. `pastes` Table

```sql
CREATE TABLE pastes (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255),
    
    -- Content Storage Strategy
    content TEXT,  -- For small pastes (< 64KB)
    content_location VARCHAR(10) DEFAULT 'db',  -- 'db' or 's3'
    content_url TEXT,  -- S3 URL if stored in object storage
    content_size BIGINT NOT NULL DEFAULT 0,  -- Size in bytes
    
    -- Metadata
    language VARCHAR(50),
    syntax_mode VARCHAR(50),  -- For syntax highlighting
    
    -- User Association
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Privacy & Access Control
    privacy VARCHAR(20) DEFAULT 'public',  -- 'public', 'private', 'unlisted'
    password_hash VARCHAR(255),  -- bcrypt hash if password protected
    burn_after_reading BOOLEAN DEFAULT FALSE,
    viewed_once BOOLEAN DEFAULT FALSE,  -- For burn after reading
    
    -- Expiration
    expires_at TIMESTAMP,
    max_views INTEGER,  -- View-based expiration (NULL = unlimited)
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,  -- Soft delete
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_privacy (privacy),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_language (language),
    
    -- Constraints
    CONSTRAINT chk_privacy CHECK (privacy IN ('public', 'private', 'unlisted')),
    CONSTRAINT chk_content_location CHECK (content_location IN ('db', 's3'))
) PARTITION BY RANGE (created_at);  -- Partition by date for scalability
```

#### 2. `users` Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
    
    -- Profile
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    
    -- Account Settings
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Limits (Premium users get higher limits)
    max_paste_size INTEGER DEFAULT 10485760,  -- 10MB default
    max_file_size INTEGER DEFAULT 10485760,  -- 10MB default
    max_pastes_per_day INTEGER DEFAULT 100,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);
```

#### 3. `files` Table

```sql
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,  -- S3 URL
    file_size BIGINT NOT NULL,  -- Size in bytes
    file_type VARCHAR(100),  -- 'image', 'document', 'code', etc.
    mime_type VARCHAR(100),  -- 'image/png', 'application/pdf', etc.
    
    -- File Metadata
    width INTEGER,  -- For images
    height INTEGER,  -- For images
    description TEXT,
    
    -- Storage Info
    storage_location VARCHAR(10) DEFAULT 's3',  -- Always S3 for files
    storage_tier VARCHAR(20) DEFAULT 'standard',  -- 'standard', 'glacier', 'archive'
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_file_type (file_type),
    INDEX idx_uploaded_at (uploaded_at)
);
```

#### 4. `analytics` Table (Aggregated Stats)

```sql
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- View Statistics
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    
    -- Geographic Data (JSON)
    countries JSONB,  -- {"US": 100, "IN": 50, ...}
    cities JSONB,     -- {"New York": 50, "Mumbai": 30, ...}
    
    -- Referrer Data (JSON)
    referrers JSONB,  -- {"google.com": 200, "github.com": 100, ...}
    
    -- Device Data (JSON)
    devices JSONB,    -- {"desktop": 500, "mobile": 300, ...}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_last_viewed_at (last_viewed_at),
    INDEX idx_view_count (view_count DESC)  -- For popular pastes
);
```

#### 5. `view_logs` Table (Detailed Logs - Partitioned)

```sql
CREATE TABLE view_logs (
    id BIGSERIAL,
    paste_id VARCHAR(20) NOT NULL,
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geographic Data
    country VARCHAR(2),  -- ISO country code
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- Device Information
    device_type VARCHAR(20),  -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- User Information
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_unique BOOLEAN DEFAULT TRUE,
    
    -- Timestamp
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_user_id (user_id),
    INDEX idx_country (country)
) PARTITION BY RANGE (viewed_at);  -- Monthly partitions

-- Create monthly partitions
CREATE TABLE view_logs_2024_12 PARTITION OF view_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

#### 6. `collections` Table (User Folders)

```sql
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Collection Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- Hex color for UI
    icon VARCHAR(50),  -- Icon identifier
    
    -- Privacy
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    
    -- Constraints
    UNIQUE(user_id, name)  -- Unique collection name per user
);
```

#### 7. `collection_pastes` Table (Many-to-Many)

```sql
CREATE TABLE collection_pastes (
    collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- Ordering
    position INTEGER DEFAULT 0,
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary Key
    PRIMARY KEY (collection_id, paste_id),
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_collection_id (collection_id),
    INDEX idx_position (position)
);
```

#### 8. `paste_versions` Table (Version History)

```sql
CREATE TABLE paste_versions (
    id BIGSERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- Version Info
    version_number INTEGER NOT NULL,
    content TEXT,
    content_location VARCHAR(10),
    content_url TEXT,
    
    -- Change Info
    change_summary TEXT,
    changed_by BIGINT REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_paste_id (paste_id),
    INDEX idx_version_number (version_number),
    
    -- Constraints
    UNIQUE(paste_id, version_number)
);
```

#### 9. `sessions` Table (User Sessions)

```sql
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Info
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    
    -- Device Info
    ip_address INET,
    user_agent TEXT,
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);
```

### Database Relationships

```
users (1) ──< (many) pastes
users (1) ──< (many) collections
users (1) ──< (many) sessions

pastes (1) ──< (many) files
pastes (1) ──< (1) analytics
pastes (1) ──< (many) view_logs
pastes (1) ──< (many) paste_versions

collections (many) ──< (many) pastes (via collection_pastes)
```

---

## 📦 File Storage Design

### Storage Strategy

#### Decision Tree

```
Paste Content Size
    │
    ├─ < 64KB → Store in PostgreSQL (content column)
    │
    └─ >= 64KB → Store in Object Storage (S3)
           │
           └─ Store S3 URL in database (content_url)
```

#### File Uploads

```
All Files → Always Store in Object Storage (S3)
    │
    ├─ Images (PNG, JPG, GIF) → S3 Standard
    │
    ├─ Documents (PDF, DOCX) → S3 Standard
    │
    └─ Large Files (> 100MB) → S3 with Multipart Upload
```

### Object Storage Architecture

#### S3 Bucket Structure

```
s3://pastebin-storage/
├── pastes/
│   ├── 2024/
│   │   ├── 12/
│   │   │   ├── abc123.txt
│   │   │   └── xyz789.txt
│   │   └── 11/
│   └── 2025/
│
├── files/
│   ├── images/
│   │   ├── 2024/12/
│   │   │   └── uuid-image.png
│   ├── documents/
│   │   ├── 2024/12/
│   │   │   └── uuid-doc.pdf
│   └── code/
│       └── 2024/12/
│           └── uuid-file.js
│
└── archive/
    └── 2020/
        └── (old pastes moved here)
```

#### Storage Tiers

**1. Standard Storage (Hot)**
- Recent pastes (< 30 days)
- Frequently accessed files
- Fast retrieval
- Higher cost

**2. Infrequent Access (Warm)**
- Older pastes (30-365 days)
- Less frequently accessed
- Slightly slower retrieval
- Lower cost

**3. Glacier/Archive (Cold)**
- Archived pastes (> 1 year)
- Rarely accessed
- Slow retrieval (hours)
- Very low cost

### CDN Integration

```
Object Storage (S3)
    │
    │ Origin
    ▼
CDN (CloudFront/Cloudflare)
    │
    │ Edge Locations
    ▼
Users (Global)
```

**CDN Configuration:**
- Cache-Control: `public, max-age=86400` (24 hours)
- Cache key: File URL
- Invalidation: On paste update/deletion
- Compression: Gzip/Brotli enabled

---

## 💾 Caching Strategy

### Multi-Level Cache Architecture

```
Request
    │
    ▼
L1: Application Memory Cache (100MB)
    │ Cache Miss
    ▼
L2: Redis Cache (50GB)
    │ Cache Miss
    ▼
L3: CDN Cache (Unlimited)
    │ Cache Miss
    ▼
L4: Database/Object Storage
```

### Cache Keys Design

#### Redis Key Patterns

```
# Paste Content
paste:{paste_id} → {content, language, metadata}
TTL: 1 hour (or until expiration)

# Paste Metadata
paste:meta:{paste_id} → {title, language, privacy, ...}
TTL: 24 hours

# Highlighted HTML
paste:html:{paste_id} → {highlighted HTML}
TTL: 24 hours

# User Sessions
session:{token} → {user_id, expires_at}
TTL: 7 days

# Popular Pastes
popular:{language} → [paste_id1, paste_id2, ...]
TTL: 1 hour

# User Paste List
user:pastes:{user_id} → [paste_id1, paste_id2, ...]
TTL: 5 minutes
```

### Cache Invalidation Strategy

**On Paste Update:**
```typescript
// Invalidate all related cache keys
await redis.del(`paste:${pasteId}`);
await redis.del(`paste:meta:${pasteId}`);
await redis.del(`paste:html:${pasteId}`);
await cdn.invalidate(`/paste/${pasteId}`);
```

**On Paste Deletion:**
```typescript
// Delete from cache
await redis.del(`paste:${pasteId}`);
await redis.del(`paste:meta:${pasteId}`);
await redis.del(`paste:html:${pasteId}`);
// CDN will expire naturally
```

**On Expiration:**
```typescript
// Background job removes expired pastes from cache
// Set TTL on cache keys to match expiration
```

### Cache Warming Strategy

**Pre-warm Popular Pastes:**
- Top 1000 pastes by view count
- Refresh every hour
- Store in Redis with longer TTL

**Pre-warm User Pastes:**
- When user logs in, cache their recent pastes
- Cache user's paste list

---

## 🔀 Data Partitioning

### Horizontal Partitioning (Sharding)

#### Sharding Strategy

**Shard Key: First Character of Paste ID**

```
Paste ID: "abc123"
First Char: 'a'
Shard: 'a' → Shard 1 (a-f)

Shard Distribution:
- Shard 0: 0-9
- Shard 1: a-f
- Shard 2: g-m
- Shard 3: n-t
- Shard 4: u-z
- Shard 5: A-F
- Shard 6: G-M
- Shard 7: N-T
- Shard 8: U-Z
```

**Shard Router:**
```typescript
function getShard(pasteId: string): number {
  const firstChar = pasteId[0].toLowerCase();
  const charCode = firstChar.charCodeAt(0);
  
  if (charCode >= 48 && charCode <= 57) return 0;  // 0-9
  if (charCode >= 97 && charCode <= 102) return 1; // a-f
  if (charCode >= 103 && charCode <= 109) return 2; // g-m
  // ... and so on
}
```

### Vertical Partitioning

#### Separate Hot and Cold Data

**Hot Data (Recent):**
- Pastes from last 30 days
- Frequently accessed
- Fast storage (SSD)

**Cold Data (Old):**
- Pastes older than 30 days
- Rarely accessed
- Slower storage (HDD/Archive)

**Partition by Date:**
```sql
-- Partition pastes table by created_at
CREATE TABLE pastes_2024_12 PARTITION OF pastes
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE pastes_2025_01 PARTITION OF pastes
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Archive Strategy

**Archive Old Pastes:**
- Pastes older than 1 year → Archive storage
- Move to Glacier/Archive tier
- Keep metadata in database
- Content retrievable but slower

**Archive Process:**
```sql
-- Find old pastes
SELECT paste_id, content_url 
FROM pastes 
WHERE created_at < NOW() - INTERVAL '1 year'
AND content_location = 's3';

-- Move to archive storage tier
-- Update storage_tier in database
UPDATE pastes 
SET storage_tier = 'archive' 
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## 💿 Backup & Recovery

### Backup Strategy

#### Database Backups

**1. Full Backup (Daily)**
- Complete database dump
- Stored in S3
- Retention: 30 days
- Compression: Gzip

**2. Incremental Backup (Hourly)**
- Only changed data
- WAL (Write-Ahead Log) archiving
- Retention: 7 days

**3. Point-in-Time Recovery**
- Continuous WAL archiving
- Can restore to any point in time
- Retention: 7 days

**Backup Script:**
```bash
# Daily full backup
pg_dump -Fc pastebin_db > backup_$(date +%Y%m%d).dump
aws s3 cp backup_*.dump s3://pastebin-backups/db/

# Hourly WAL archive
# Configured in postgresql.conf
archive_mode = on
archive_command = 'aws s3 cp %p s3://pastebin-backups/wal/%f'
```

#### Object Storage Backups

**S3 Versioning:**
- Enable versioning on S3 bucket
- Keep all versions of files
- Can restore deleted files

**Cross-Region Replication:**
- Replicate to secondary region
- Disaster recovery
- Automatic failover

**Lifecycle Policies:**
```
Standard → Infrequent Access (after 30 days)
Infrequent Access → Glacier (after 90 days)
Glacier → Delete (after 5 years)
```

### Disaster Recovery

#### Recovery Time Objectives (RTO)

- **Database**: 1 hour (from backup)
- **Object Storage**: 5 minutes (from replica)
- **Application**: 15 minutes (redeploy)

#### Recovery Point Objectives (RPO)

- **Database**: 1 hour (last backup)
- **Object Storage**: Real-time (replication)
- **Application**: N/A (stateless)

#### Recovery Procedures

**1. Database Recovery:**
```bash
# Stop application
# Restore from backup
pg_restore -d pastebin_db backup_20241207.dump

# Or point-in-time recovery
pg_basebackup -D /var/lib/postgresql/data
# Apply WAL logs up to target time
```

**2. Object Storage Recovery:**
```bash
# Restore from cross-region replica
# Or restore from version history
aws s3api restore-object \
  --bucket pastebin-storage \
  --key pastes/2024/12/abc123.txt \
  --restore-request '{"Days":1,"GlacierJobParameters":{"Tier":"Expedited"}}'
```

**3. Application Recovery:**
```bash
# Redeploy from Git
git pull
npm install
npm run build
pm2 restart all
```

---

## ⚡ Storage Optimization

### Database Optimization

#### Indexing Strategy

**Primary Indexes:**
- `paste_id` (UNIQUE) - Primary lookup
- `user_id` - User queries
- `expires_at` - Cleanup queries
- `created_at` - Time-based queries

**Composite Indexes:**
```sql
-- For user's pastes query
CREATE INDEX idx_user_created ON pastes(user_id, created_at DESC);

-- For popular pastes query
CREATE INDEX idx_privacy_views ON pastes(privacy, view_count DESC) 
WHERE privacy = 'public';

-- For expiration cleanup
CREATE INDEX idx_expires_created ON pastes(expires_at, created_at) 
WHERE expires_at IS NOT NULL;
```

#### Query Optimization

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM pastes 
WHERE paste_id = 'abc123';
```

**Connection Pooling:**
- Max connections: 100 per server
- Use PgBouncer for connection pooling
- Idle timeout: 5 minutes

**Query Caching:**
- Cache frequently used queries
- Invalidate on data changes

### Object Storage Optimization

#### Compression

**Text Compression:**
- Gzip compression for text files
- 70-80% size reduction
- Automatic decompression on retrieval

**Image Optimization:**
- Compress images (JPEG quality 85%)
- Convert to WebP format
- Serve appropriate size based on device

#### CDN Optimization

**Cache Headers:**
```
Cache-Control: public, max-age=86400
ETag: "abc123"
Last-Modified: Wed, 07 Dec 2024 12:00:00 GMT
```

**Compression:**
- Enable Brotli compression
- 15-20% better than Gzip
- Automatic for supported browsers

### Storage Cost Optimization

**Cost Breakdown (Estimated):**
- Database Storage: $0.10/GB/month
- S3 Standard: $0.023/GB/month
- S3 Infrequent Access: $0.0125/GB/month
- S3 Glacier: $0.004/GB/month
- CDN Bandwidth: $0.085/GB

**Optimization Strategies:**
1. Move old data to cheaper tiers
2. Compress content before storage
3. Use CDN to reduce origin bandwidth
4. Archive rarely accessed data
5. Delete expired pastes promptly

---

## 📊 Storage Metrics

### Key Metrics to Monitor

1. **Database Size**
   - Total database size
   - Table sizes
   - Index sizes
   - Growth rate

2. **Object Storage Size**
   - Total storage used
   - By storage tier
   - By file type
   - Growth rate

3. **Cache Performance**
   - Cache hit rate (target: > 80%)
   - Cache memory usage
   - Eviction rate

4. **CDN Performance**
   - Cache hit rate (target: > 90%)
   - Bandwidth usage
   - Origin requests

5. **Backup Status**
   - Last backup time
   - Backup size
   - Backup success rate

### Monitoring Queries

```sql
-- Database size
SELECT 
    pg_size_pretty(pg_database_size('pastebin_db')) AS db_size;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Cache hit rate (from application metrics)
-- Tracked in Redis/Monitoring system
```

---

## 🎯 Summary

### Storage Architecture Decisions

1. **Database**: PostgreSQL for metadata and small content (< 64KB)
2. **Object Storage**: S3 for large content and all files
3. **Caching**: Multi-level (Memory → Redis → CDN → Storage)
4. **Partitioning**: Horizontal (by paste ID) and vertical (by date)
5. **Backup**: Daily full + hourly incremental + point-in-time recovery
6. **CDN**: CloudFront/Cloudflare for global distribution

### Storage Capacity

- **Database**: ~400 TB (text only, 5 years)
- **Object Storage**: ~9.2 PB (with files, 5 years)
- **Cache**: 50GB Redis + unlimited CDN
- **Total**: ~9.6 PB

### Performance Targets

- **Database Query**: < 50ms (p95)
- **S3 Retrieval**: < 200ms (p95)
- **CDN Hit**: < 10ms (p95)
- **Cache Hit Rate**: > 80%

---

*Complete storage design for Pastebin - optimized for scale and performance!*

