# Twitter System Design - Complete Guide

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Requirements Gathering](#requirements-gathering)
3. [Capacity Estimation](#capacity-estimation)
4. [High-Level Design](#high-level-design)
5. [Detailed Design](#detailed-design)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Core Flows](#core-flows)
9. [Scalability & Performance](#scalability--performance)
10. [Security Considerations](#security-considerations)

---

## 🎯 Problem Statement

**Twitter** ek microblogging aur social networking platform hai jo users ko 280 characters tak ke short messages (tweets) post karne ki facility deta hai. Users apne followers ko updates share kar sakte hain, dusre users ko follow kar sakte hain, aur real-time conversations mein participate kar sakte hain.

**Use Cases:**
- Users tweets post karte hain (text, images, videos)
- Users dusre users ko follow/unfollow karte hain
- Users apni personalized timeline dekhte hain
- Users tweets ko like, retweet, aur reply karte hain
- Trending topics aur hashtags track karte hain
- Real-time notifications receive karte hain
- Search functionality for tweets aur users

**Example:**
- User tweet karta hai: "Hello World! #FirstTweet"
- Tweet user ke followers ki timeline mein appear hota hai
- Other users like, retweet, ya reply kar sakte hain
- Trending topics update hote hain

---

## 📝 Requirements Gathering

### Functional Requirements

#### 1. **User Management**
   - User registration aur authentication
   - Profile management (bio, avatar, cover photo)
   - Verified accounts support
   - User search functionality
   - Profile view with user stats

#### 2. **Tweet Management**
   - Tweet creation (text, images, videos, polls)
   - Tweet deletion
   - Tweet editing (with history)
   - Character limit: 280 characters
   - Media upload support (images, videos, GIFs)
   - Thread creation (multiple connected tweets)
   - Quote tweets

#### 3. **Social Features**
   - Follow/unfollow users
   - Like tweets
   - Retweet (with or without comment)
   - Reply to tweets
   - Mention users (@username)
   - Direct messages (DMs)
   - Block/mute users

#### 4. **Timeline Generation**
   - Home timeline (tweets from followed users)
   - User timeline (specific user's tweets)
   - Mentions timeline
   - Likes timeline
   - Chronological and algorithmic sorting

#### 5. **Discovery Features**
   - Trending topics
   - Hashtag tracking
   - Search (tweets, users, hashtags)
   - Explore page
   - Recommendations (who to follow)

#### 6. **Notifications**
   - Real-time notifications
   - Like notifications
   - Retweet notifications
   - Reply notifications
   - Follow notifications
   - Mention notifications

#### 7. **Analytics**
   - Tweet impressions
   - Engagement metrics
   - Follower growth
   - Profile views

### Non-Functional Requirements

1. **Availability**: 99.99% uptime (high availability)
2. **Performance**: 
   - Tweet posting: < 200ms
   - Timeline loading: < 500ms (with cache)
   - Search results: < 1 second
   - Real-time notifications: < 100ms delay
3. **Scalability**: 
   - 500M daily active users
   - 500M tweets per day
   - 100:1 read/write ratio
   - Support millions of concurrent users
4. **Durability**: 
   - No data loss
   - Backup and replication
   - Disaster recovery
5. **Security**: 
   - Authentication (JWT)
   - Authorization
   - Rate limiting
   - XSS/CSRF protection
   - Content moderation
6. **Consistency**:
   - Eventual consistency for timelines
   - Strong consistency for user data
   - Eventual consistency for follower counts

---

## 📊 Capacity Estimation

### Traffic Estimates

**Assumptions:**
- 500 million daily active users (DAU)
- 500 million tweets per day (writes)
- 100:1 read/write ratio
- 50 billion timeline reads per day
- Average tweet size: 300 bytes (text only)
- Average media size: 2 MB (images/videos)
- 30% of tweets have media attached

### Storage Estimates

**Per Tweet (Text Only):**
- Tweet content: 300 bytes average
- Metadata (ID, user_id, timestamps, counts): 200 bytes
- Total: ~500 bytes per tweet

**Per Tweet (With Media):**
- Tweet content: 300 bytes
- Media: 2 MB average
- Metadata: 200 bytes
- Total: ~2 MB per tweet

**For 5 years:**
- 500M tweets/day × 365 days × 5 years = 912.5 billion tweets
- Text only (70%): 912.5B × 0.7 × 500 bytes = ~319 TB
- With media (30%): 912.5B × 0.3 × 2 MB = ~547 PB
- **Total storage: ~547 PB**

### Bandwidth Estimates

**Write requests:**
- 500M tweets/day = 5,787 tweets/second
- Average: 5,787 × 500 bytes = ~2.9 MB/s (text only)
- With media: 5,787 × 0.3 × 2 MB = ~3.5 GB/s
- **Total write bandwidth: ~3.5 GB/s**

**Read requests:**
- 50B reads/day = 578,703 reads/second
- Average: 578,703 × 500 bytes = ~289 MB/s (text)
- With media: 578,703 × 0.3 × 2 MB = ~347 GB/s
- **Total read bandwidth: ~347 GB/s**

### Cache Requirements

**Hot tweets:** Top 20% = 100M tweets
- Average size: 500 bytes
- **Cache size needed: ~50 GB**

**User timelines:** 10M active users
- 100 tweets per timeline: 500 bytes each
- **Cache size: ~500 GB**

### Server Requirements

**Application Servers:**
- Write QPS: 5,787/second
- Read QPS: 578,703/second
- Each server can handle: ~10,000 QPS
- **Need: ~60 application servers**

**Database:**
- Write: 5,787 writes/second
- Read: 578,703 reads/second (mostly from cache)
- Database reads: ~57,870/second (90% cache hit rate)
- **Need: Distributed database with sharding**

---

## 🏗️ High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  (Web App, Mobile App - iOS/Android, Desktop App)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  CDN (CloudFront)                           │
│            (Static Assets, Media Files)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Load Balancer (AWS ELB)                    │
│            (Distributes requests across servers)            │
└───────────┬───────────────────────────────┬─────────────────┘
            │                               │
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   API Gateway        │      │   WebSocket Server   │
│   (REST API)         │      │   (Real-time)        │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           └──────────────┬──────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Tweet      │  │   Timeline   │  │   User       │
│   Service    │  │   Service    │  │   Service    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │    Redis     │  │  AWS S3      │
│  (Sharded)   │  │   (Cache)    │  │  (Media)     │
│              │  │              │  │              │
│ - Users      │  │ - Timelines  │  │ - Images     │
│ - Tweets     │  │ - Hot Tweets │  │ - Videos     │
│ - Follows    │  │ - Sessions   │  │ - GIFs       │
└──────────────┘  └──────────────┘  └──────────────┘
         │
         ▼
┌──────────────┐
│ Elasticsearch│
│  (Search)    │
└──────────────┘
         │
         ▼
┌──────────────┐
│   Kafka      │
│ (Event Bus)  │
└──────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │   User       │  │   Tweet      │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴──────┐     │
│  │              Follow Service                        │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────┐     │
│  │              Timeline Service                      │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────┐     │
│  │           Notification Service                     │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │ Elasticsearch│ │  AWS S3      │
│  Database    │ │    Cache     │ │   Search     │ │  Storage     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    users    │         │   tweets    │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)     │
│ username    │   │     │ user_id(FK) │──┐
│ email       │   │     │ content     │  │
│ password    │   │     │ media_urls  │  │
│ display_name│   │     │ reply_to_id │  │
│ bio         │   │     │ retweet_id  │  │
│ avatar_url  │   │     │ like_count  │  │
│ cover_url   │   │     │ retweet_ct  │  │
│ verified    │   │     │ reply_count │  │
│ follower_ct │   │     │ created_at  │  │
│ following_ct│   │     │ is_deleted  │  │
│ tweet_count │   │     └─────────────┘  │
│ created_at  │   │                      │
└─────────────┘   │     ┌─────────────┐  │
                  │     │   follows   │  │
                  │     ├─────────────┤  │
                  └─────┤ follower_id │  │
                        │ following_id│  │
                        │ created_at  │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │    likes    │  │
                        ├─────────────┤  │
                        │ user_id(FK) │──┘
                        │ tweet_id(FK)│──┐
                        │ created_at  │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │  retweets   │  │
                        ├─────────────┤  │
                        │ id (PK)     │  │
                        │ user_id(FK) │──┘
                        │ tweet_id(FK)│──┐
                        │ comment     │  │
                        │ created_at  │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │  hashtags   │  │
                        ├─────────────┤  │
                        │ id (PK)     │  │
                        │ tag         │  │
                        │ tweet_count │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │tweet_hashtag│  │
                        ├─────────────┤  │
                        │ tweet_id(FK)│──┘
                        │ hashtag_id  │
                        └─────────────┘
```

### Table Schemas

#### 1. Users Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    tweet_count INTEGER DEFAULT 0,
    location VARCHAR(100),
    website VARCHAR(255),
    birth_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Design Decisions:**
- Denormalized counters for fast profile loading
- Soft delete with `is_active` flag
- Verified badge support for authenticated accounts
- Unique constraints on username and email

#### 2. Tweets Table

```sql
CREATE TABLE tweets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls JSONB,  -- Array of media URLs
    reply_to_id BIGINT REFERENCES tweets(id) ON DELETE SET NULL,
    retweet_id BIGINT REFERENCES tweets(id) ON DELETE SET NULL,
    quote_tweet_id BIGINT REFERENCES tweets(id) ON DELETE SET NULL,
    like_count INTEGER DEFAULT 0,
    retweet_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    impression_count BIGINT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT content_length CHECK (LENGTH(content) <= 280)
);

-- Indexes
CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX idx_tweets_reply_to_id ON tweets(reply_to_id);
CREATE INDEX idx_tweets_retweet_id ON tweets(retweet_id);
CREATE INDEX idx_tweets_is_deleted ON tweets(is_deleted);

-- Composite index for user timeline
CREATE INDEX idx_tweets_user_created ON tweets(user_id, created_at DESC) 
WHERE is_deleted = FALSE;
```

**Design Decisions:**
- JSONB for flexible media storage
- Support for replies, retweets, and quote tweets
- Denormalized engagement counters
- Soft delete for data retention
- Character limit constraint

#### 3. Follows Table

```sql
CREATE TABLE follows (
    follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at);
```

**Design Decisions:**
- Composite primary key prevents duplicate follows
- Check constraint prevents self-follow
- Bidirectional indexes for follower/following queries

#### 4. Likes Table

```sql
CREATE TABLE likes (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tweet_id BIGINT NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tweet_id)
);

-- Indexes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_tweet_id ON likes(tweet_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);
```

#### 5. Retweets Table

```sql
CREATE TABLE retweets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tweet_id BIGINT NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    comment TEXT,  -- For quote tweets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tweet_id)
);

-- Indexes
CREATE INDEX idx_retweets_user_id ON retweets(user_id);
CREATE INDEX idx_retweets_tweet_id ON retweets(tweet_id);
CREATE INDEX idx_retweets_created_at ON retweets(created_at DESC);
```

#### 6. Hashtags Table

```sql
CREATE TABLE hashtags (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(100) UNIQUE NOT NULL,
    tweet_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_tweet_count ON hashtags(tweet_count DESC);
```

#### 7. Tweet_Hashtags Table (Many-to-many)

```sql
CREATE TABLE tweet_hashtags (
    tweet_id BIGINT NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    hashtag_id BIGINT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (tweet_id, hashtag_id)
);

CREATE INDEX idx_tweet_hashtags_hashtag_id ON tweet_hashtags(hashtag_id);
```

#### 8. Notifications Table

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- 'like', 'retweet', 'reply', 'follow', 'mention'
    tweet_id BIGINT REFERENCES tweets(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

#### 9. Direct Messages Table

```sql
CREATE TABLE direct_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_dm_sender_receiver ON direct_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_dm_receiver ON direct_messages(receiver_id, is_read);
```

### Sharding Strategy

**Shard by User ID:**
- Users table sharded by user_id
- Tweets table sharded by user_id
- Follows table sharded by follower_id
- Consistent hashing for distribution

**Example:**
```
Shard 0: user_id % 10 = 0
Shard 1: user_id % 10 = 1
...
Shard 9: user_id % 10 = 9
```

---

## 🔌 API Design

### RESTful Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/logout            Logout user
POST   /api/auth/refresh-token     Refresh JWT token
```

#### User Endpoints

```
GET    /api/users/:id                    Get user profile
PUT    /api/users/:id                    Update user profile
GET    /api/users/:id/tweets             Get user's tweets
GET    /api/users/:id/followers          Get followers list
GET    /api/users/:id/following          Get following list
POST   /api/users/:id/follow             Follow user
DELETE /api/users/:id/follow             Unfollow user
GET    /api/users/search?q=:query        Search users
```

#### Tweet Endpoints

```
POST   /api/tweets                       Create new tweet
GET    /api/tweets/:id                   Get tweet details
DELETE /api/tweets/:id                   Delete tweet
POST   /api/tweets/:id/like              Like tweet
DELETE /api/tweets/:id/like              Unlike tweet
POST   /api/tweets/:id/retweet           Retweet
DELETE /api/tweets/:id/retweet           Undo retweet
POST   /api/tweets/:id/reply             Reply to tweet
GET    /api/tweets/:id/replies           Get tweet replies
GET    /api/tweets/:id/retweets          Get retweet users
GET    /api/tweets/:id/likes             Get users who liked
```

#### Timeline Endpoints

```
GET    /api/timeline/home                Get home timeline
GET    /api/timeline/user/:id            Get user timeline
GET    /api/timeline/mentions            Get mentions
GET    /api/timeline/likes               Get liked tweets
```

#### Trending & Discovery

```
GET    /api/trending/topics              Get trending topics
GET    /api/trending/hashtags            Get trending hashtags
GET    /api/search/tweets?q=:query       Search tweets
GET    /api/search/users?q=:query        Search users
GET    /api/recommendations/users        Get user recommendations
```

#### Notification Endpoints

```
GET    /api/notifications                Get notifications
PUT    /api/notifications/:id/read       Mark as read
PUT    /api/notifications/read-all       Mark all as read
```

#### Direct Message Endpoints

```
GET    /api/messages                     Get conversations
GET    /api/messages/:userId             Get messages with user
POST   /api/messages/:userId             Send message
```

### Request/Response Examples

#### Create Tweet

**Request:**
```json
POST /api/tweets
Authorization: Bearer <token>

{
  "content": "Hello Twitter! This is my first tweet #FirstTweet",
  "media_urls": ["https://cdn.twitter.com/media/image1.jpg"],
  "reply_to_id": null
}
```

**Response:**
```json
{
  "id": 123456789,
  "user": {
    "id": 1,
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://cdn.twitter.com/avatars/1.jpg",
    "verified": false
  },
  "content": "Hello Twitter! This is my first tweet #FirstTweet",
  "media_urls": ["https://cdn.twitter.com/media/image1.jpg"],
  "like_count": 0,
  "retweet_count": 0,
  "reply_count": 0,
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

#### Get Home Timeline

**Request:**
```
GET /api/timeline/home?limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tweets": [
    {
      "id": 123456789,
      "user": {
        "id": 2,
        "username": "janedoe",
        "display_name": "Jane Doe",
        "avatar_url": "https://cdn.twitter.com/avatars/2.jpg",
        "verified": true
      },
      "content": "Great day today! ☀️",
      "media_urls": [],
      "like_count": 42,
      "retweet_count": 10,
      "reply_count": 5,
      "is_liked": false,
      "is_retweeted": false,
      "created_at": "2024-01-01T11:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## 🔄 Core Flows

### 1. User Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ POST /api/auth/register
     │ {username, email, password, display_name}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Validate input                  │
│     ├─ Check username uniqueness   │
│     ├─ Check email uniqueness      │
│     ├─ Validate email format       │
│     └─ Validate password strength   │
│                                     │
│  2. Hash password (bcrypt)          │
│                                     │
│  3. Create user record              │
│     └─ INSERT INTO users           │
│                                     │
│  4. Generate JWT token              │
│     ├─ Access token (15 min)       │
│     └─ Refresh token (7 days)      │
│                                     │
│  5. Store session in Redis          │
│                                     │
│  6. Return user + tokens            │
└────┬────────────────────────────────┘
     │
     │ Response: {user, accessToken, refreshToken}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

### 2. Tweet Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ POST /api/tweets
     │ {content, media_urls}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate user (JWT)         │
│                                     │
│  2. Validate tweet                  │
│     ├─ Check content length (≤280) │
│     ├─ Validate media URLs         │
│     └─ Rate limit check             │
│                                     │
│  3. Extract hashtags                │
│     └─ Parse #hashtag from content │
│                                     │
│  4. Extract mentions                │
│     └─ Parse @username from content│
│                                     │
│  5. Create tweet record             │
│     └─ INSERT INTO tweets          │
│                                     │
│  6. Store hashtags                  │
│     ├─ INSERT INTO hashtags        │
│     └─ INSERT INTO tweet_hashtags  │
│                                     │
│  7. Update user tweet_count         │
│     └─ UPDATE users                │
│                                     │
│  8. Fan-out to followers' timelines │
│     └─ Redis ZADD (async)          │
│                                     │
│  9. Create mention notifications    │
│     └─ INSERT INTO notifications   │
│                                     │
│ 10. Index in Elasticsearch         │
│     └─ For search functionality    │
│                                     │
│ 11. Publish to Kafka                │
│     └─ For real-time updates       │
│                                     │
│ 12. Return tweet object             │
└────┬────────────────────────────────┘
     │
     │ Response: {tweet}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

**Fan-out Strategy:**

**Push Model (for users with < 1M followers):**
```typescript
// When user posts a tweet
const followers = await getFollowers(userId);
for (const follower of followers) {
  const timelineKey = `timeline:${follower.id}`;
  await zadd(timelineKey, tweet.created_at, tweet.id);
}
```

**Pull Model (for celebrities with > 1M followers):**
```typescript
// When user requests timeline
const following = await getFollowing(userId);
const tweets = await getTweetsFromUsers(following, limit, offset);
return tweets;
```

**Hybrid Model:**
- Push for normal users
- Pull for celebrities
- Cache celebrity tweets separately

### 3. Follow User Flow

```
┌─────────┐
│ User A  │
└────┬────┘
     │
     │ POST /api/users/:id/follow
     │ {following_id: User B}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate User A             │
│                                     │
│  2. Validate User B exists          │
│     └─ SELECT FROM users            │
│                                     │
│  3. Check if already following      │
│     └─ SELECT FROM follows          │
│                                     │
│  4. Prevent self-follow             │
│                                     │
│  5. Create follow relationship      │
│     └─ INSERT INTO follows         │
│                                     │
│  6. Update counters                 │
│     ├─ Increment User B's          │
│     │  follower_count              │
│     └─ Increment User A's          │
│        following_count              │
│                                     │
│  7. Add User B's tweets to         │
│     User A's timeline cache        │
│     └─ Redis ZADD (async)         │
│                                     │
│  8. Create follow notification      │
│     └─ INSERT INTO notifications   │
│                                     │
│  9. Send real-time notification     │
│     └─ WebSocket push              │
│                                     │
│ 10. Return success                 │
└────┬────────────────────────────────┘
     │
     │ Response: {message: "User followed"}
     ▼
┌─────────┐
│ User A  │
└─────────┘
```

### 4. Home Timeline Generation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ GET /api/timeline/home?limit=20
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate user               │
│                                     │
│  2. Check Redis cache               │
│     └─ ZRANGE timeline:user_id     │
│        (sorted by timestamp DESC)  │
│                                     │
│  3a. Cache HIT                      │
│      ├─ Get tweet IDs from Redis   │
│      ├─ Fetch tweet details        │
│      │  (batch query or cache)     │
│      └─ Return tweets               │
│                                     │
│  3b. Cache MISS                     │
│      ├─ Get following IDs           │
│      ├─ Query tweets from DB       │
│      │  (with pagination)          │
│      ├─ Cache results in Redis    │
│      │  (TTL: 5 minutes)           │
│      └─ Return tweets               │
│                                     │
│  4. Enrich tweet data               │
│     ├─ Add user info                │
│     ├─ Add is_liked flag           │
│     ├─ Add is_retweeted flag       │
│     └─ Add media URLs               │
│                                     │
│  5. Return paginated results        │
└────┬────────────────────────────────┘
     │
     │ Response: {tweets, pagination}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

**Timeline Cache Strategy:**

```typescript
// Redis Structure
Key: timeline:user_id
Type: Sorted Set
Score: timestamp (milliseconds)
Member: tweet_id

// Example
timeline:123 = {
  "456": 1704110400000,  // Tweet 456 at timestamp
  "789": 1704110500000,  // Tweet 789 at timestamp
  "101": 1704110600000   // Tweet 101 at timestamp
}

// Get timeline
const tweetIds = await zrevrange('timeline:123', 0, 19); // Top 20
const tweets = await getTweetsByIds(tweetIds);
```

### 5. Like Tweet Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ POST /api/tweets/:id/like
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate user               │
│                                     │
│  2. Validate tweet exists           │
│                                     │
│  3. Check if already liked          │
│     └─ SELECT FROM likes            │
│                                     │
│  4. Create like record              │
│     └─ INSERT INTO likes           │
│                                     │
│  5. Increment like_count            │
│     └─ Redis INCR (async)          │
│                                     │
│  6. Create notification             │
│     └─ INSERT INTO notifications   │
│                                     │
│  7. Send real-time notification     │
│     └─ WebSocket push              │
│                                     │
│  8. Update trending score           │
│     └─ If tweet is trending        │
│                                     │
│  9. Return success                 │
└────┬────────────────────────────────┘
     │
     │ Response: {message: "Tweet liked"}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

### 6. Search Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ GET /api/search/tweets?q=keyword
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate user               │
│                                     │
│  2. Validate search query           │
│     ├─ Sanitize input               │
│     └─ Check rate limits            │
│                                     │
│  3. Query Elasticsearch             │
│     ├─ Full-text search             │
│     ├─ Fuzzy matching               │
│     ├─ Relevance scoring            │
│     └─ Filter by date/user          │
│                                     │
│  4. Get tweet IDs from results      │
│                                     │
│  5. Fetch full tweet data           │
│     ├─ Check Redis cache            │
│     └─ Query PostgreSQL if needed  │
│                                     │
│  6. Rank and sort results           │
│     ├─ By relevance                 │
│     ├─ By recency                   │
│     └─ By engagement                │
│                                     │
│  7. Return search results           │
└────┬────────────────────────────────┘
     │
     │ Response: {tweets, pagination}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

---

## 🚀 Scalability & Performance

### 1. Database Scaling

**Read Replicas:**
- Master-Slave setup
- Writes: Master
- Reads: Slaves (round-robin)
- Replication lag: < 100ms

**Sharding:**
- Shard by user_id (consistent hashing)
- 100 shards initially
- Each shard: 5M users

**Partitioning:**
```sql
-- Partition tweets by created_at (monthly)
CREATE TABLE tweets_2024_01 PARTITION OF tweets
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE tweets_2024_02 PARTITION OF tweets
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 2. Caching Strategy

**Multi-level Caching:**

**L1 Cache (Application Memory):**
- Hot user profiles
- Trending topics
- TTL: 1 minute

**L2 Cache (Redis Cluster):**
- User timelines
- Tweet details
- User sessions
- TTL: 5-60 minutes

**L3 Cache (CDN):**
- Media files (images, videos)
- Static assets
- TTL: 24 hours

**Cache Invalidation:**
```typescript
// When user posts a tweet
await invalidateCache(`timeline:${userId}`);
await invalidateFollowersTimelines(userId);

// When user updates profile
await invalidateCache(`user:${userId}`);
```

### 3. Load Balancing

**Strategies:**
- Geographic distribution (multi-region)
- Least connections
- Sticky sessions for WebSocket

**Auto-scaling:**
- Scale based on CPU (> 70%)
- Scale based on request rate
- Predictive scaling for peak hours

### 4. Rate Limiting

**Per User:**
- 300 tweets per 3 hours
- 1000 follows per day
- 1000 likes per day
- 100 API requests per minute

**Implementation:**
```typescript
// Token bucket algorithm
const key = `rate:${userId}:tweets`;
const count = await incr(key);
if (count === 1) {
  await expire(key, 3 * 60 * 60); // 3 hours
}
if (count > 300) {
  throw new Error('Rate limit exceeded');
}
```

### 5. Media Optimization

**Image Processing:**
- Original: Store in S3
- Thumbnail: 150x150 (profile)
- Small: 340x340 (mobile)
- Medium: 680x680 (web)
- Large: 1024x1024 (full view)

**Video Processing:**
- Transcode to multiple bitrates
- Generate thumbnails
- Adaptive streaming (HLS)

**CDN Strategy:**
- CloudFront for global distribution
- Edge caching
- Lazy loading

### 6. Real-time Updates

**WebSocket Architecture:**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ WebSocket
       ▼
┌─────────────┐
│  WS Server  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Redis    │
│   Pub/Sub   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Kafka     │
│ Event Bus   │
└─────────────┘
```

**Notification Types:**
- New tweet from followed user
- Like on your tweet
- Retweet of your tweet
- Reply to your tweet
- New follower
- Mention in tweet

### 7. Search Optimization

**Elasticsearch Configuration:**
```json
{
  "settings": {
    "number_of_shards": 10,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "tweet_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "snowball"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "tweet_analyzer"
      },
      "user_id": { "type": "long" },
      "created_at": { "type": "date" },
      "like_count": { "type": "integer" },
      "retweet_count": { "type": "integer" }
    }
  }
}
```

### 8. Trending Topics Algorithm

**Scoring Formula:**
```
Score = (engagement_count × recency_factor) / time_decay

Where:
- engagement_count = likes + retweets + replies
- recency_factor = 1 / (hours_since_creation + 1)
- time_decay = exponential decay over 24 hours
```

**Implementation:**
```typescript
async function calculateTrendingScore(tweet: Tweet): Promise<number> {
  const engagement = tweet.like_count + tweet.retweet_count + tweet.reply_count;
  const hoursSince = (Date.now() - tweet.created_at.getTime()) / (1000 * 60 * 60);
  const recencyFactor = 1 / (hoursSince + 1);
  const timeDecay = Math.exp(-hoursSince / 24);
  
  return engagement * recencyFactor * timeDecay;
}
```

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

**JWT Token Strategy:**
```typescript
// Access Token (15 minutes)
const accessToken = jwt.sign(
  { userId, username },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// Refresh Token (7 days)
const refreshToken = jwt.sign(
  { userId },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### 2. Input Validation

**Tweet Content:**
- XSS prevention (sanitize HTML)
- SQL injection prevention (parameterized queries)
- Character limit enforcement
- Malicious link detection

### 3. Rate Limiting

**DDoS Protection:**
- Cloudflare protection
- Rate limiting per IP
- CAPTCHA for suspicious activity

### 4. Content Moderation

**Automated Filtering:**
- Spam detection (ML models)
- Hate speech detection
- NSFW content detection
- Fake news detection

**Reporting System:**
- User reporting
- Manual review queue
- Automated suspension

### 5. Privacy Controls

**User Settings:**
- Private accounts
- Block users
- Mute users
- Hide sensitive content

### 6. Data Encryption

**At Rest:**
- Database encryption (AES-256)
- S3 bucket encryption

**In Transit:**
- HTTPS/TLS 1.3
- WebSocket Secure (WSS)

---

## 📈 Monitoring & Analytics

### 1. Metrics to Track

**System Metrics:**
- Request latency (p50, p95, p99)
- Error rates
- Cache hit rates
- Database query performance

**Business Metrics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Tweet creation rate
- Engagement rate
- Retention rate

### 2. Logging

**Structured Logging:**
```typescript
logger.info('Tweet created', {
  userId,
  tweetId,
  duration: Date.now() - startTime,
  hasMedia: !!mediaUrls.length
});
```

### 3. Alerting

**Critical Alerts:**
- Database down
- Redis down
- High error rate (> 5%)
- High latency (p95 > 1s)
- Low cache hit rate (< 80%)

---

## 🎯 Summary

This Twitter system design provides:

✅ **Scalability**: Handles 500M DAU with sharding and caching
✅ **Performance**: Sub-second response times with multi-level caching
✅ **Reliability**: 99.99% uptime with redundancy and failover
✅ **Real-time**: WebSocket for instant notifications
✅ **Search**: Elasticsearch for fast full-text search
✅ **Security**: JWT auth, rate limiting, content moderation
✅ **Analytics**: Comprehensive metrics and monitoring

**Next Steps:**
1. Implement the backend services
2. Set up database and caching
3. Build API endpoints
4. Add real-time features
5. Implement search functionality
6. Deploy and scale

---

**Tech Stack:**
- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL (sharded)
- **Cache**: Redis Cluster
- **Search**: Elasticsearch
- **Storage**: AWS S3
- **CDN**: CloudFront
- **Message Queue**: Kafka
- **Real-time**: WebSocket
- **Monitoring**: Prometheus, Grafana
