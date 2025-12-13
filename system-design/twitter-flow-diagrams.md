# Twitter System Flow Diagrams

## 📊 Detailed Flow Diagrams

### 1. Tweet Creation - Complete Flow

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Tweet Service
    participant User Service
    participant PostgreSQL
    participant Redis
    participant S3
    participant Kafka
    participant Timeline Worker
    participant Notification Worker
    
    Client->>API Gateway: POST /api/tweets
    API Gateway->>Tweet Service: Create Tweet Request
    
    Tweet Service->>User Service: Validate User & Auth
    User Service-->>Tweet Service: User Validated
    
    Tweet Service->>Tweet Service: Validate Content (≤280 chars)
    Tweet Service->>Tweet Service: Extract Hashtags
    Tweet Service->>Tweet Service: Extract Mentions
    
    alt Has Media
        Tweet Service->>S3: Upload Media Files
        S3-->>Tweet Service: Media URLs
    end
    
    Tweet Service->>PostgreSQL: INSERT INTO tweets
    PostgreSQL-->>Tweet Service: Tweet ID
    
    Tweet Service->>PostgreSQL: INSERT INTO hashtags
    Tweet Service->>PostgreSQL: INSERT INTO tweet_hashtags
    
    Tweet Service->>PostgreSQL: UPDATE users SET tweet_count++
    
    Tweet Service->>Redis: Cache Tweet
    Tweet Service->>Kafka: Publish TweetCreated Event
    
    Kafka->>Timeline Worker: Process Timeline Fan-out
    Timeline Worker->>PostgreSQL: Get Followers
    Timeline Worker->>Redis: ZADD to Follower Timelines
    
    Kafka->>Notification Worker: Process Mentions
    Notification Worker->>PostgreSQL: INSERT INTO notifications
    Notification Worker->>Redis: Pub/Sub Real-time Notification
    
    Tweet Service-->>API Gateway: Tweet Created Response
    API Gateway-->>Client: 201 Created
```

### 2. Timeline Generation - Fan-out on Write

```mermaid
flowchart TD
    A[User Posts Tweet] --> B{User Type?}
    
    B -->|Normal User| C[Fan-out on Write]
    B -->|Celebrity| D[Fan-out on Read]
    
    C --> E[Get All Followers]
    E --> F[For Each Follower]
    F --> G[Add Tweet to Timeline Cache]
    G --> H[Redis ZADD timeline:follower_id]
    
    D --> I[Store Tweet Only]
    I --> J[Mark as Celebrity Tweet]
    
    K[User Requests Timeline] --> L{Check Cache}
    L -->|Cache Hit| M[Get Tweet IDs from Redis]
    L -->|Cache Miss| N[Query Database]
    
    M --> O[Fetch Tweet Details]
    N --> P[Get Following List]
    P --> Q[Query Tweets from DB]
    Q --> R[Cache Results]
    R --> O
    
    O --> S[Enrich with User Data]
    S --> T[Add Engagement Flags]
    T --> U[Return Timeline]
```

### 3. Follow/Unfollow Flow with Timeline Update

```mermaid
flowchart TD
    A[User A Follows User B] --> B[Validate Users Exist]
    B --> C{Already Following?}
    
    C -->|Yes| D[Return Error]
    C -->|No| E[INSERT INTO follows]
    
    E --> F[Update Counters]
    F --> G[User A: following_count++]
    F --> H[User B: follower_count++]
    
    H --> I{User B Tweet Count?}
    I -->|< 100 tweets| J[Get All User B Tweets]
    I -->|≥ 100 tweets| K[Get Recent 100 Tweets]
    
    J --> L[Add to User A Timeline Cache]
    K --> L
    
    L --> M[Redis ZADD timeline:userA_id]
    M --> N[Create Follow Notification]
    N --> O[Send Real-time Notification]
    O --> P[Return Success]
    
    Q[User A Unfollows User B] --> R[DELETE FROM follows]
    R --> S[Update Counters]
    S --> T[User A: following_count--]
    S --> U[User B: follower_count--]
    
    U --> V[Remove User B Tweets from Timeline]
    V --> W[Redis ZREM timeline:userA_id]
    W --> X[Return Success]
```

### 4. Like/Unlike Flow with Real-time Updates

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Like Service
    participant PostgreSQL
    participant Redis
    participant Notification Service
    participant WebSocket
    participant Tweet Owner
    
    User->>API: POST /api/tweets/:id/like
    API->>Like Service: Like Tweet Request
    
    Like Service->>PostgreSQL: Check if Already Liked
    
    alt Not Liked
        Like Service->>PostgreSQL: INSERT INTO likes
        Like Service->>Redis: INCR likes:tweet_id
        Like Service->>PostgreSQL: UPDATE tweets SET like_count++
        
        Like Service->>Notification Service: Create Like Notification
        Notification Service->>PostgreSQL: INSERT INTO notifications
        Notification Service->>Redis: PUBLISH notification:user_id
        
        Redis->>WebSocket: Real-time Event
        WebSocket->>Tweet Owner: Push Notification
        
        Like Service-->>API: Success
        API-->>User: 200 OK
    else Already Liked
        Like Service-->>API: Error
        API-->>User: 409 Conflict
    end
```

### 5. Search Flow with Elasticsearch

```mermaid
flowchart TD
    A[User Searches for Tweets] --> B[Sanitize Query]
    B --> C[Check Rate Limit]
    
    C --> D{Rate Limit OK?}
    D -->|No| E[Return 429 Too Many Requests]
    D -->|Yes| F[Query Elasticsearch]
    
    F --> G[Full-text Search on Content]
    G --> H[Apply Filters]
    H --> I[Date Range]
    H --> J[User Filter]
    H --> K[Language Filter]
    
    I --> L[Calculate Relevance Score]
    J --> L
    K --> L
    
    L --> M[Sort by Score & Recency]
    M --> N[Get Tweet IDs]
    
    N --> O{Check Redis Cache}
    O -->|Cache Hit| P[Get Tweet Details from Cache]
    O -->|Cache Miss| Q[Query PostgreSQL]
    
    Q --> R[Fetch Tweet Data]
    R --> S[Cache in Redis]
    S --> P
    
    P --> T[Enrich with User Info]
    T --> U[Add Engagement Data]
    U --> V[Return Search Results]
```

### 6. Trending Topics Algorithm

```mermaid
flowchart TD
    A[Background Job Every 5 Minutes] --> B[Query Recent Tweets]
    B --> C[Extract All Hashtags]
    
    C --> D[For Each Hashtag]
    D --> E[Count Occurrences in Last Hour]
    E --> F[Count Occurrences in Last 24 Hours]
    
    F --> G[Calculate Velocity]
    G --> H[Velocity = Hour_Count / Day_Count]
    
    H --> I[Calculate Engagement Score]
    I --> J[Score = Likes + Retweets + Replies]
    
    J --> K[Calculate Trending Score]
    K --> L[Trending = Velocity × Engagement × Recency]
    
    L --> M{Score > Threshold?}
    M -->|Yes| N[Add to Trending List]
    M -->|No| O[Skip]
    
    N --> P[Sort by Score DESC]
    P --> Q[Take Top 50]
    Q --> R[Cache in Redis]
    R --> S[Set TTL: 5 minutes]
```

### 7. Notification System Architecture

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}
    
    B -->|Like| C[Like Event]
    B -->|Retweet| D[Retweet Event]
    B -->|Reply| E[Reply Event]
    B -->|Follow| F[Follow Event]
    B -->|Mention| G[Mention Event]
    
    C --> H[Publish to Kafka]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Notification Worker]
    I --> J[Create Notification Record]
    J --> K[PostgreSQL INSERT]
    
    K --> L{User Online?}
    L -->|Yes| M[Send via WebSocket]
    L -->|No| N[Store for Later]
    
    M --> O[Redis Pub/Sub]
    O --> P[WebSocket Server]
    P --> Q[Push to Client]
    
    N --> R[Increment Unread Count]
    R --> S[Cache in Redis]
```

### 8. Direct Message Flow

```mermaid
sequenceDiagram
    participant Sender
    participant API
    participant DM Service
    participant PostgreSQL
    participant Redis
    participant WebSocket
    participant Receiver
    
    Sender->>API: POST /api/messages/:userId
    API->>DM Service: Send Message Request
    
    DM Service->>PostgreSQL: Check if Users Can DM
    
    alt Can Send DM
        DM Service->>PostgreSQL: INSERT INTO direct_messages
        DM Service->>Redis: Cache Message
        DM Service->>Redis: Update Conversation List
        
        DM Service->>Redis: PUBLISH dm:receiver_id
        Redis->>WebSocket: Real-time Event
        
        WebSocket->>Receiver: Push Message
        
        DM Service-->>API: Success
        API-->>Sender: 201 Created
    else Cannot Send DM
        DM Service-->>API: Error
        API-->>Sender: 403 Forbidden
    end
```

### 9. Media Upload Flow

```mermaid
flowchart TD
    A[User Uploads Media] --> B[Validate File Type]
    B --> C{Valid Type?}
    
    C -->|No| D[Return Error]
    C -->|Yes| E[Check File Size]
    
    E --> F{Size OK?}
    F -->|No| G[Return Error: File Too Large]
    F -->|Yes| H[Generate Unique Filename]
    
    H --> I[Scan for Viruses]
    I --> J{Safe?}
    
    J -->|No| K[Return Error: Malicious File]
    J -->|Yes| L{Media Type?}
    
    L -->|Image| M[Process Image]
    L -->|Video| N[Process Video]
    L -->|GIF| O[Process GIF]
    
    M --> P[Generate Thumbnails]
    P --> Q[Compress Original]
    Q --> R[Upload to S3]
    
    N --> S[Transcode Video]
    S --> T[Generate Preview]
    T --> U[Create HLS Playlist]
    U --> R
    
    O --> V[Optimize GIF]
    V --> R
    
    R --> W[Get CDN URLs]
    W --> X[Return Media URLs]
```

### 10. Rate Limiting Flow

```mermaid
flowchart TD
    A[API Request] --> B[Extract User ID / IP]
    B --> C[Get Rate Limit Key]
    C --> D[Redis GET rate:key]
    
    D --> E{Key Exists?}
    E -->|No| F[Redis SET rate:key = 1]
    E -->|Yes| G[Redis INCR rate:key]
    
    F --> H[Redis EXPIRE rate:key TTL]
    H --> I[Allow Request]
    
    G --> J{Count > Limit?}
    J -->|Yes| K[Return 429 Too Many Requests]
    J -->|No| I
    
    I --> L[Process Request]
    L --> M[Return Response]
```

### 11. Cache Invalidation Strategy

```mermaid
flowchart TD
    A[Data Mutation Event] --> B{Event Type}
    
    B -->|Tweet Created| C[Invalidate User Timeline]
    B -->|Tweet Deleted| D[Invalidate All Timelines]
    B -->|User Updated| E[Invalidate User Cache]
    B -->|Follow/Unfollow| F[Invalidate Timeline Cache]
    
    C --> G[Get User Followers]
    G --> H[For Each Follower]
    H --> I[Redis DEL timeline:follower_id]
    
    D --> J[Redis DEL tweet:tweet_id]
    J --> K[Update Timeline Caches]
    
    E --> L[Redis DEL user:user_id]
    L --> M[Redis DEL profile:user_id]
    
    F --> N[Redis DEL timeline:user_id]
    N --> O[Rebuild on Next Request]
```

### 12. Database Sharding Strategy

```mermaid
flowchart TD
    A[User Request] --> B[Extract User ID]
    B --> C[Calculate Shard]
    C --> D[Shard = user_id % num_shards]
    
    D --> E{Shard Number}
    E -->|0| F[Shard 0: Users 0, 10, 20...]
    E -->|1| G[Shard 1: Users 1, 11, 21...]
    E -->|2| H[Shard 2: Users 2, 12, 22...]
    E -->|N| I[Shard N: Users N, N+10...]
    
    F --> J[PostgreSQL Instance 0]
    G --> K[PostgreSQL Instance 1]
    H --> L[PostgreSQL Instance 2]
    I --> M[PostgreSQL Instance N]
    
    J --> N[Execute Query]
    K --> N
    L --> N
    M --> N
    
    N --> O[Return Results]
```

---

## 🔄 Background Workers

### 1. Timeline Fan-out Worker

**Purpose:** Distribute tweets to followers' timelines asynchronously

**Frequency:** Real-time (event-driven)

**Process:**
```typescript
async function timelineFanoutWorker() {
  const consumer = kafka.consumer({ groupId: 'timeline-fanout' });
  
  await consumer.subscribe({ topic: 'tweet-created' });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const { tweetId, userId } = JSON.parse(message.value);
      
      // Get followers
      const followers = await getFollowers(userId);
      
      // Fan out to followers
      for (const follower of followers) {
        await redis.zadd(
          `timeline:${follower.id}`,
          tweet.created_at.getTime(),
          tweetId
        );
      }
    }
  });
}
```

### 2. Engagement Counter Worker

**Purpose:** Flush like/retweet counts from Redis to PostgreSQL

**Frequency:** Every 10 seconds

**Process:**
```typescript
async function engagementCounterWorker() {
  setInterval(async () => {
    // Get all like counters
    const likeKeys = await redis.keys('likes:*');
    
    for (const key of likeKeys) {
      const tweetId = key.replace('likes:', '');
      const count = await redis.get(key);
      
      if (count > 0) {
        await db.query(
          'UPDATE tweets SET like_count = like_count + $1 WHERE id = $2',
          [count, tweetId]
        );
        
        await redis.del(key);
      }
    }
  }, 10000);
}
```

### 3. Trending Topics Worker

**Purpose:** Calculate and update trending topics

**Frequency:** Every 5 minutes

**Process:**
```typescript
async function trendingTopicsWorker() {
  setInterval(async () => {
    // Get hashtags from last hour
    const recentHashtags = await getRecentHashtags(1); // 1 hour
    
    // Calculate trending scores
    const trending = [];
    for (const hashtag of recentHashtags) {
      const score = await calculateTrendingScore(hashtag);
      trending.push({ hashtag, score });
    }
    
    // Sort and cache top 50
    trending.sort((a, b) => b.score - a.score);
    const top50 = trending.slice(0, 50);
    
    await redis.setex('trending:topics', 300, JSON.stringify(top50));
  }, 300000); // 5 minutes
}
```

### 4. Notification Delivery Worker

**Purpose:** Process and deliver notifications

**Frequency:** Real-time (event-driven)

**Process:**
```typescript
async function notificationWorker() {
  const consumer = kafka.consumer({ groupId: 'notifications' });
  
  await consumer.subscribe({ topic: 'user-actions' });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value);
      
      // Create notification
      const notification = await createNotification(event);
      
      // Check if user is online
      const isOnline = await redis.get(`online:${event.targetUserId}`);
      
      if (isOnline) {
        // Send via WebSocket
        await sendRealtimeNotification(event.targetUserId, notification);
      } else {
        // Store for later
        await redis.incr(`unread:${event.targetUserId}`);
      }
    }
  });
}
```

### 5. Search Index Worker

**Purpose:** Index tweets in Elasticsearch

**Frequency:** Real-time (event-driven)

**Process:**
```typescript
async function searchIndexWorker() {
  const consumer = kafka.consumer({ groupId: 'search-indexer' });
  
  await consumer.subscribe({ topic: 'tweet-created' });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const tweet = JSON.parse(message.value);
      
      // Index in Elasticsearch
      await esClient.index({
        index: 'tweets',
        id: tweet.id,
        body: {
          content: tweet.content,
          user_id: tweet.user_id,
          created_at: tweet.created_at,
          like_count: tweet.like_count,
          retweet_count: tweet.retweet_count
        }
      });
    }
  });
}
```

---

## 📊 Performance Benchmarks

### Expected Latencies

| Operation | Target | Acceptable | Notes |
|-----------|--------|------------|-------|
| Tweet Creation | < 200ms | < 500ms | Including fan-out initiation |
| Timeline Load (cached) | < 100ms | < 300ms | From Redis |
| Timeline Load (uncached) | < 500ms | < 1s | From PostgreSQL |
| Search Query | < 500ms | < 1s | Elasticsearch |
| Like/Unlike | < 100ms | < 200ms | Redis increment |
| Follow/Unfollow | < 200ms | < 500ms | Including counter updates |
| Notification Delivery | < 100ms | < 200ms | Real-time via WebSocket |
| Media Upload | < 2s | < 5s | Depends on file size |

### Cache Hit Rates

| Cache Type | Target Hit Rate | Notes |
|------------|----------------|-------|
| Timeline Cache | > 90% | For active users |
| Tweet Cache | > 80% | For popular tweets |
| User Profile Cache | > 95% | Frequently accessed |
| Search Results Cache | > 70% | Common queries |

### Database Query Performance

| Query Type | Target | Index Strategy |
|------------|--------|----------------|
| Get User Timeline | < 50ms | Composite index on (user_id, created_at) |
| Get Tweet by ID | < 10ms | Primary key lookup |
| Get Followers | < 100ms | Index on follower_id |
| Search Tweets | < 200ms | Elasticsearch full-text index |

---

## 🎯 Capacity Planning

### Storage Growth

| Year | Users | Tweets | Storage |
|------|-------|--------|---------|
| Year 1 | 100M | 182B | 109 PB |
| Year 2 | 200M | 365B | 219 PB |
| Year 3 | 350M | 638B | 383 PB |
| Year 5 | 500M | 912B | 547 PB |

### Infrastructure Requirements

**Application Servers:**
- Initial: 60 servers
- Year 1: 100 servers
- Year 3: 200 servers
- Year 5: 300 servers

**Database Shards:**
- Initial: 10 shards
- Year 1: 50 shards
- Year 3: 100 shards
- Year 5: 200 shards

**Redis Cluster:**
- Initial: 10 nodes
- Year 1: 20 nodes
- Year 3: 40 nodes
- Year 5: 60 nodes

**Elasticsearch Cluster:**
- Initial: 10 nodes
- Year 1: 20 nodes
- Year 3: 40 nodes
- Year 5: 60 nodes
