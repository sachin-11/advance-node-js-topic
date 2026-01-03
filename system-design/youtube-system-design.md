# 🎥 YouTube System Design - Complete Architecture

Complete production-ready system design for YouTube-like platform with video upload, streaming, comments, and recommendations.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Requirements](#requirements)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Design](#component-design)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Scalability & Performance](#scalability--performance)
9. [Technology Stack](#technology-stack)

---

## 🏗️ System Overview

YouTube is a video-sharing platform that allows users to:
- Upload videos
- Stream videos with adaptive bitrate
- Comment on videos
- Receive personalized recommendations
- Search and discover content

### Key Challenges

1. **Video Upload**: Large file handling, processing, transcoding
2. **Streaming**: Low latency, adaptive bitrate, global distribution
3. **Comments**: Real-time updates, nested replies, moderation
4. **Recommendations**: Personalization at scale, real-time updates

---

## 📊 Requirements

### Functional Requirements

1. **Video Upload**
   - Upload videos up to 4GB (or configurable limit)
   - Support multiple video formats (MP4, MOV, AVI, etc.)
   - Background processing and transcoding
   - Multiple quality/resolution options (144p, 240p, 360p, 480p, 720p, 1080p, 4K)
   - Thumbnail generation
   - Video metadata (title, description, tags, category)

2. **Video Streaming**
   - Adaptive bitrate streaming (HLS/DASH)
   - Low latency streaming
   - Support for live streaming
   - Resume playback from last watched position
   - Multiple quality options

3. **Comments System**
   - Post comments on videos
   - Reply to comments (nested replies)
   - Edit/Delete comments
   - Like/Dislike comments
   - Real-time comment updates
   - Comment moderation (spam detection, profanity filter)

4. **Recommendations**
   - Personalized video recommendations
   - Trending videos
   - Related videos
   - Search functionality
   - Channel subscriptions

### Non-Functional Requirements

1. **Scalability**: Support 1B+ users, 500+ hours of video uploaded per minute
2. **Availability**: 99.9% uptime
3. **Performance**: 
   - Video upload: < 5 minutes processing time
   - Streaming: < 2 seconds initial buffering
   - Comments: < 100ms response time
   - Recommendations: < 200ms response time
4. **Reliability**: Data consistency, fault tolerance
5. **Security**: Authentication, authorization, content protection

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Web    │  │  Mobile  │  │   TV     │  │  API     │           │
│  │   App    │  │   App    │  │   App    │  │ Clients  │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└───────┼─────────────┼─────────────┼─────────────┼──────────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   CloudFlare │  │   AWS ALB    │  │   Nginx      │             │
│  │   / CloudFront│  │   / ELB     │  │   LB         │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Rate Limiting │ Authentication │ Request Routing │ Logging │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Upload     │   │  Streaming   │   │  Comments    │
│   Service    │   │   Service    │   │   Service    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Video       │   │  CDN         │   │  Real-time    │
│  Processing  │   │  (Edge)      │   │  Service      │
│  Service     │   │              │   │  (WebSocket)  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Data Layer                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  PostgreSQL  │  │    Redis     │  │  Cassandra   │             │
│  │  (Metadata)  │  │   (Cache)    │  │  (Comments)  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Elasticsearch│  │   MongoDB    │  │   Kafka       │             │
│  │  (Search)    │  │  (Analytics) │  │  (Events)     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Storage Layer                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   S3/GCS     │  │   CDN        │  │   Object     │             │
│  │  (Raw Videos)│  │  (Cached)    │  │   Storage    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Design

### 1. Video Upload Service

**Responsibilities:**
- Handle video upload requests
- Validate file size and format
- Store raw video in object storage
- Trigger transcoding pipeline
- Update video metadata

**Flow:**
```
User Upload → API Gateway → Upload Service
                              │
                              ├─→ Validate (size, format)
                              ├─→ Upload to S3 (raw video)
                              ├─→ Store metadata in PostgreSQL
                              ├─→ Publish event to Kafka
                              └─→ Return upload_id
```

**Key Components:**
- **Upload Controller**: Handle HTTP multipart upload
- **Validation Service**: Check file size, format, virus scan
- **Storage Service**: Upload to S3 with chunked upload for large files
- **Metadata Service**: Store video info in PostgreSQL

### 2. Video Processing Service

**Responsibilities:**
- Transcode videos to multiple resolutions
- Generate thumbnails
- Extract metadata (duration, resolution, codec)
- Create HLS/DASH manifests
- Update video status

**Flow:**
```
Kafka Event → Processing Service
                │
                ├─→ Download from S3
                ├─→ Transcode (FFmpeg)
                │   ├─→ 144p, 240p, 360p, 480p, 720p, 1080p, 4K
                │   └─→ Generate HLS segments
                ├─→ Generate thumbnails (multiple)
                ├─→ Upload processed videos to S3
                ├─→ Update metadata in PostgreSQL
                └─→ Invalidate CDN cache
```

**Key Components:**
- **Transcoding Worker**: FFmpeg-based transcoding
- **Thumbnail Generator**: Extract frames at intervals
- **Manifest Generator**: Create HLS/DASH playlists
- **Status Manager**: Track processing status

### 3. Streaming Service

**Responsibilities:**
- Serve video segments via CDN
- Handle adaptive bitrate selection
- Manage playback sessions
- Track watch history
- Handle live streaming

**Flow:**
```
Client Request → CDN (Edge)
                  │
                  ├─→ Cache Hit → Return segment
                  └─→ Cache Miss → Origin Server
                                    │
                                    ├─→ S3 → Return segment
                                    └─→ Update CDN cache
```

**Key Components:**
- **Streaming Controller**: Handle segment requests
- **CDN Manager**: Cache invalidation, edge routing
- **Session Manager**: Track playback sessions
- **Watch History Service**: Record watch events

### 4. Comments Service

**Responsibilities:**
- Store and retrieve comments
- Handle nested replies
- Real-time comment updates
- Comment moderation
- Like/Dislike functionality

**Flow:**
```
Post Comment → Comments Service
                │
                ├─→ Validate (spam check, profanity)
                ├─→ Store in Cassandra (time-series)
                ├─→ Update comment count in PostgreSQL
                ├─→ Publish to WebSocket (real-time)
                └─→ Index in Elasticsearch (search)
```

**Key Components:**
- **Comment Controller**: CRUD operations
- **Moderation Service**: Spam detection, profanity filter
- **Real-time Service**: WebSocket for live updates
- **Search Service**: Elasticsearch for comment search

### 5. Recommendations Service

**Responsibilities:**
- Generate personalized recommendations
- Calculate trending videos
- Find related videos
- Handle search queries

**Flow:**
```
Request → Recommendations Service
           │
           ├─→ Check Redis cache
           ├─→ If miss:
           │   ├─→ Fetch user history
           │   ├─→ Calculate similarity scores
           │   ├─→ Rank videos
           │   └─→ Cache results
           └─→ Return recommendations
```

**Key Components:**
- **Recommendation Engine**: Collaborative filtering, content-based
- **Trending Calculator**: Real-time trending algorithm
- **Search Service**: Elasticsearch-based search
- **Cache Manager**: Redis for caching recommendations

---

## 🗄️ Database Design

### PostgreSQL Schema (Primary Database)

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    channel_name VARCHAR(100),
    channel_description TEXT,
    subscriber_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### Videos Table
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags TEXT[], -- Array of tags
    
    -- Video Files
    raw_video_url TEXT, -- S3 URL for raw video
    video_status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'ready', 'failed'
    
    -- Processed Videos (Multiple Resolutions)
    video_144p_url TEXT,
    video_240p_url TEXT,
    video_360p_url TEXT,
    video_480p_url TEXT,
    video_720p_url TEXT,
    video_1080p_url TEXT,
    video_4k_url TEXT,
    
    -- HLS/DASH Manifests
    hls_manifest_url TEXT,
    dash_manifest_url TEXT,
    
    -- Thumbnails
    thumbnail_url TEXT,
    thumbnail_urls TEXT[], -- Multiple thumbnails
    
    -- Metadata
    duration INTEGER, -- Duration in seconds
    resolution VARCHAR(20), -- Original resolution
    file_size BIGINT, -- Size in bytes
    codec VARCHAR(50),
    bitrate INTEGER,
    
    -- Statistics
    view_count BIGINT DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Privacy & Settings
    privacy VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'unlisted'
    is_live BOOLEAN DEFAULT FALSE,
    live_viewers INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(video_status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX idx_videos_privacy ON videos(privacy);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags); -- GIN index for array search
```

#### Comments Table (PostgreSQL - for metadata)
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    comment_id VARCHAR(20) UNIQUE NOT NULL,
    video_id VARCHAR(20) REFERENCES videos(video_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id VARCHAR(20) REFERENCES comments(comment_id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'approved', -- 'approved', 'pending', 'rejected'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    channel_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscriber_id, channel_id)
);

CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_channel ON subscriptions(channel_id);
```

#### Watch History Table
```sql
CREATE TABLE watch_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(20) REFERENCES videos(video_id) ON DELETE CASCADE,
    watch_position INTEGER DEFAULT 0, -- Position in seconds
    watch_percentage DECIMAL(5,2), -- Percentage watched
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_video ON watch_history(video_id);
CREATE INDEX idx_watch_history_created_at ON watch_history(created_at DESC);
```

#### Likes Table
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(20) REFERENCES videos(video_id) ON DELETE CASCADE,
    like_type VARCHAR(10) NOT NULL, -- 'like', 'dislike'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_likes_video ON likes(video_id);
CREATE INDEX idx_likes_user ON likes(user_id);
```

### Cassandra Schema (Time-Series Data)

#### Comments Time-Series Table
```sql
CREATE TABLE comments_by_video (
    video_id VARCHAR,
    comment_id VARCHAR,
    user_id INT,
    parent_comment_id VARCHAR,
    content TEXT,
    like_count INT,
    dislike_count INT,
    reply_count INT,
    created_at TIMESTAMP,
    PRIMARY KEY ((video_id), created_at, comment_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- For nested replies
CREATE TABLE comment_replies (
    comment_id VARCHAR,
    reply_id VARCHAR,
    user_id INT,
    content TEXT,
    like_count INT,
    created_at TIMESTAMP,
    PRIMARY KEY ((comment_id), created_at, reply_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

#### Watch Events Table
```sql
CREATE TABLE watch_events (
    user_id INT,
    video_id VARCHAR,
    event_time TIMESTAMP,
    event_type VARCHAR, -- 'play', 'pause', 'seek', 'end'
    watch_position INT,
    duration INT,
    PRIMARY KEY ((user_id), event_time, video_id)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

### Redis Schema (Caching)

**Key Patterns:**
- `video:{video_id}` - Video metadata cache
- `video:{video_id}:views` - View count cache
- `user:{user_id}:watch_history` - User watch history cache
- `user:{user_id}:recommendations` - User recommendations cache
- `trending:videos` - Trending videos list
- `video:{video_id}:comments` - Comments cache
- `session:{session_id}` - Playback session cache

### Elasticsearch Schema (Search)

**Index: videos**
```json
{
  "mappings": {
    "properties": {
      "video_id": {"type": "keyword"},
      "title": {"type": "text", "analyzer": "standard"},
      "description": {"type": "text", "analyzer": "standard"},
      "tags": {"type": "keyword"},
      "category": {"type": "keyword"},
      "view_count": {"type": "long"},
      "like_count": {"type": "integer"},
      "created_at": {"type": "date"},
      "user_id": {"type": "integer"}
    }
  }
}
```

**Index: comments**
```json
{
  "mappings": {
    "properties": {
      "comment_id": {"type": "keyword"},
      "video_id": {"type": "keyword"},
      "content": {"type": "text", "analyzer": "standard"},
      "user_id": {"type": "integer"},
      "created_at": {"type": "date"}
    }
  }
}
```

---

## 🔌 API Design

### Video Upload APIs

#### 1. Initiate Upload
```
POST /api/v1/videos/upload/initiate
Request Body:
{
  "title": "My Video",
  "description": "Video description",
  "category": "Entertainment",
  "tags": ["tag1", "tag2"],
  "privacy": "public",
  "file_size": 104857600,
  "file_type": "video/mp4"
}

Response:
{
  "upload_id": "upload_123",
  "upload_url": "https://s3.amazonaws.com/bucket/upload_123",
  "chunk_size": 5242880,
  "expires_at": "2024-01-01T12:00:00Z"
}
```

#### 2. Upload Chunk
```
PUT /api/v1/videos/upload/{upload_id}/chunk
Headers:
  Content-Range: bytes 0-5242879/104857600
  Content-Type: video/mp4

Request Body: [Binary chunk data]

Response:
{
  "upload_id": "upload_123",
  "bytes_uploaded": 5242880,
  "total_bytes": 104857600,
  "status": "uploading"
}
```

#### 3. Complete Upload
```
POST /api/v1/videos/upload/{upload_id}/complete
Response:
{
  "video_id": "dQw4w9WgXcQ",
  "status": "processing",
  "estimated_processing_time": 300
}
```

#### 4. Get Upload Status
```
GET /api/v1/videos/{video_id}/status
Response:
{
  "video_id": "dQw4w9WgXcQ",
  "status": "processing", // "processing", "ready", "failed"
  "progress": 75,
  "estimated_time_remaining": 60
}
```

### Video Streaming APIs

#### 5. Get Video Metadata
```
GET /api/v1/videos/{video_id}
Response:
{
  "video_id": "dQw4w9WgXcQ",
  "title": "My Video",
  "description": "Video description",
  "user": {
    "user_id": 123,
    "username": "johndoe",
    "display_name": "John Doe"
  },
  "duration": 180,
  "view_count": 1000,
  "like_count": 50,
  "comment_count": 10,
  "created_at": "2024-01-01T00:00:00Z",
  "video_urls": {
    "hls": "https://cdn.example.com/videos/dQw4w9WgXcQ/master.m3u8",
    "dash": "https://cdn.example.com/videos/dQw4w9WgXcQ/manifest.mpd"
  },
  "thumbnails": [
    "https://cdn.example.com/thumbnails/dQw4w9WgXcQ/thumb1.jpg"
  ]
}
```

#### 6. Get Video Stream
```
GET /api/v1/videos/{video_id}/stream
Query Parameters:
  - quality: "auto" | "144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "4k"
  - format: "hls" | "dash"

Response: Redirects to CDN URL or returns manifest file
```

#### 7. Update Watch Position
```
POST /api/v1/videos/{video_id}/watch-position
Request Body:
{
  "position": 120, // seconds
  "duration": 180
}

Response:
{
  "success": true,
  "position": 120
}
```

### Comments APIs

#### 8. Get Comments
```
GET /api/v1/videos/{video_id}/comments
Query Parameters:
  - page: 1
  - limit: 20
  - sort: "newest" | "top" | "oldest"
  - parent_id: null (for top-level comments)

Response:
{
  "comments": [
    {
      "comment_id": "cmt_123",
      "user": {
        "user_id": 123,
        "username": "johndoe",
        "avatar_url": "https://..."
      },
      "content": "Great video!",
      "like_count": 10,
      "dislike_count": 0,
      "reply_count": 2,
      "created_at": "2024-01-01T00:00:00Z",
      "replies": [
        {
          "comment_id": "cmt_124",
          "user": {...},
          "content": "I agree!",
          "like_count": 5,
          "created_at": "2024-01-01T00:05:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "has_more": true
  }
}
```

#### 9. Post Comment
```
POST /api/v1/videos/{video_id}/comments
Request Body:
{
  "content": "Great video!",
  "parent_id": null // null for top-level, comment_id for reply
}

Response:
{
  "comment_id": "cmt_123",
  "content": "Great video!",
  "user": {...},
  "like_count": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 10. Like/Dislike Comment
```
POST /api/v1/comments/{comment_id}/like
Request Body:
{
  "action": "like" // "like" | "dislike" | "remove"
}

Response:
{
  "success": true,
  "like_count": 11,
  "dislike_count": 0
}
```

### Recommendations APIs

#### 11. Get Recommendations
```
GET /api/v1/recommendations
Query Parameters:
  - limit: 20
  - category: "Entertainment" (optional)

Response:
{
  "recommendations": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Recommended Video",
      "thumbnail_url": "https://...",
      "duration": 180,
      "view_count": 1000,
      "user": {
        "username": "johndoe",
        "display_name": "John Doe"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "relevance_score": 0.95
    }
  ]
}
```

#### 12. Get Trending Videos
```
GET /api/v1/videos/trending
Query Parameters:
  - category: "Entertainment" (optional)
  - time_range: "day" | "week" | "month" | "all"
  - limit: 20

Response:
{
  "trending": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Trending Video",
      "view_count": 1000000,
      "like_count": 50000,
      "trending_score": 0.98,
      ...
    }
  ]
}
```

#### 13. Search Videos
```
GET /api/v1/search
Query Parameters:
  - q: "search query"
  - type: "video" | "channel" | "playlist"
  - sort: "relevance" | "date" | "views" | "rating"
  - page: 1
  - limit: 20

Response:
{
  "results": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Search Result",
      "description": "...",
      "thumbnail_url": "https://...",
      "view_count": 1000,
      "created_at": "2024-01-01T00:00:00Z",
      "relevance_score": 0.92
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "has_more": true
  }
}
```

---

## 📈 Data Flow Diagrams

### Video Upload Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. POST /api/v1/videos/upload/initiate
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐     2. Validate & Generate upload_id
│ Upload Service  │──────────────────────────────────────┐
└────┬────────────┘                                      │
     │ 3. Return S3 presigned URL                        │
     ▼                                                   │
┌─────────┐                                             │
│  User   │ 4. Upload chunks directly to S3            │
└────┬────┘                                             │
     │                                                  │
     ▼                                                  │
┌─────────┐                                             │
│   S3    │ 5. Store raw video                         │
└────┬────┘                                             │
     │                                                  │
     ▼                                                  │
┌─────────────────┐                                     │
│ Upload Service  │ 6. POST /complete                  │
└────┬────────────┘                                     │
     │                                                  │
     ├─→ 7. Store metadata in PostgreSQL               │
     ├─→ 8. Publish event to Kafka                    │
     └─→ 9. Return video_id                            │
                                                       │
┌─────────────────┐                                    │
│ Kafka Consumer  │←───────────────────────────────────┘
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│Processing Worker│
└────┬────────────┘
     │
     ├─→ Download from S3
     ├─→ Transcode (multiple resolutions)
     ├─→ Generate thumbnails
     ├─→ Create HLS/DASH manifests
     ├─→ Upload to S3
     └─→ Update PostgreSQL (status = 'ready')
```

### Video Streaming Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/v1/videos/{video_id}
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐     2. Check Redis cache
│ Streaming       │──────────────────────────┐
│ Service         │                          │
└────┬────────────┘                          │
     │                                       │
     ├─→ Cache Hit → Return metadata        │
     │                                       │
     └─→ Cache Miss → Query PostgreSQL      │
                      └──────────────────────┘
     │
     ▼
┌─────────┐
│  User   │ 3. GET video segment (HLS)
└────┬────┘
     │
     ▼
┌─────────────────┐     4. Check CDN cache
│      CDN        │──────────────────────────┐
└────┬────────────┘                          │
     │                                       │
     ├─→ Cache Hit → Return segment         │
     │                                       │
     └─→ Cache Miss → Origin Server         │
                      └──────────────────────┘
     │
     ▼
┌─────────┐
│   S3    │ 5. Return video segment
└─────────┘
```

### Comments Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. POST /api/v1/videos/{video_id}/comments
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Comments        │
│ Service         │
└────┬────────────┘
     │
     ├─→ 2. Validate (spam check, profanity)
     ├─→ 3. Store in Cassandra
     ├─→ 4. Update comment count in PostgreSQL
     ├─→ 5. Index in Elasticsearch
     └─→ 6. Publish to WebSocket
     │
     ▼
┌─────────────────┐
│  WebSocket      │ 7. Broadcast to all connected clients
│  Server         │
└─────────────────┘
```

### Recommendations Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/v1/recommendations
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐     2. Check Redis cache
│ Recommendations│──────────────────────────┐
│ Service         │                          │
└────┬────────────┘                          │
     │                                       │
     ├─→ Cache Hit → Return recommendations  │
     │                                       │
     └─→ Cache Miss → Calculate             │
                      └──────────────────────┘
     │
     ├─→ 3. Fetch user watch history (Cassandra)
     ├─→ 4. Fetch user preferences (PostgreSQL)
     ├─→ 5. Calculate similarity scores
     ├─→ 6. Rank videos
     ├─→ 7. Cache in Redis
     └─→ 8. Return recommendations
```

---

## 🚀 Scalability & Performance

### Scaling Strategies

1. **Horizontal Scaling**
   - Stateless API servers (add more instances)
   - Database read replicas
   - CDN for global distribution
   - Multiple Kafka partitions

2. **Caching Strategy**
   - **Redis**: Hot data (video metadata, recommendations, trending)
   - **CDN**: Video segments, thumbnails, static assets
   - **Application Cache**: Frequently accessed data

3. **Database Optimization**
   - **PostgreSQL**: Read replicas, connection pooling, indexing
   - **Cassandra**: Distributed across multiple nodes
   - **Elasticsearch**: Sharding and replication

4. **Video Processing**
   - Distributed transcoding workers
   - Queue-based processing (Kafka)
   - Parallel processing for multiple resolutions

### Performance Optimizations

1. **Video Upload**
   - Chunked upload for large files
   - Resumable uploads
   - Background processing

2. **Streaming**
   - CDN caching
   - Adaptive bitrate streaming
   - Prefetching next segments

3. **Comments**
   - Pagination
   - Lazy loading of replies
   - Caching top comments

4. **Recommendations**
   - Pre-computed recommendations
   - Incremental updates
   - Batch processing

### Capacity Planning

**Assumptions:**
- 1B users
- 500 hours of video uploaded per minute
- 1B video views per day
- Average video size: 100MB
- Average video duration: 10 minutes

**Storage:**
- Raw videos: 500 hours/min × 60 min × 24 hours × 100MB = ~72TB/day
- Processed videos (7 resolutions): 72TB × 7 = ~504TB/day
- Total storage per year: ~180PB

**Bandwidth:**
- 1B views/day × 100MB = 100PB/day
- Peak bandwidth: ~1.2PB/hour (assuming 10% peak)

**Compute:**
- Transcoding: 500 hours/min × 60 = 30,000 hours/min
- Need ~500 transcoding workers (assuming 1 hour video = 1 hour processing)

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js / Fastify
- **Language**: TypeScript
- **Authentication**: JWT, OAuth2

### Databases
- **PostgreSQL**: Primary database (metadata, users, videos)
- **Cassandra**: Time-series data (comments, watch events)
- **Redis**: Caching and sessions
- **Elasticsearch**: Search and recommendations
- **MongoDB**: Analytics (optional)

### Storage
- **AWS S3 / Google Cloud Storage**: Video storage
- **CDN**: CloudFront / Cloudflare

### Message Queue
- **Apache Kafka**: Event streaming, processing queue

### Video Processing
- **FFmpeg**: Video transcoding
- **AWS MediaConvert**: Cloud transcoding (alternative)

### Real-time
- **WebSocket**: Real-time comments, live chat
- **Socket.io**: WebSocket library

### Monitoring & Logging
- **Prometheus**: Metrics
- **Grafana**: Visualization
- **ELK Stack**: Logging

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **AWS / GCP**: Cloud platform

---

## 📝 Next Steps

1. **Implementation Phases**
   - Phase 1: Basic video upload and streaming
   - Phase 2: Comments system
   - Phase 3: Recommendations
   - Phase 4: Advanced features (live streaming, analytics)

2. **Code Structure**
   - Follow existing project patterns (like pastebin-project)
   - Separate services for each component
   - Use TypeScript for type safety
   - Implement proper error handling

3. **Testing**
   - Unit tests for services
   - Integration tests for APIs
   - Load testing for scalability

4. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Deployment guide
   - Developer guide

---

## 🔐 Security Considerations

1. **Authentication & Authorization**
   - JWT tokens with refresh tokens
   - Role-based access control
   - Rate limiting

2. **Content Security**
   - Video encryption
   - DRM for premium content
   - Access control for private videos

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection

4. **Moderation**
   - Spam detection
   - Profanity filtering
   - Content moderation (AI + human)

---

**End of System Design Document**

