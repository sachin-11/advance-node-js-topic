# Twitter Features Added to Instagram Project

## ✅ Completed

### 1. Feature Comparison Document
- Created `TWITTER-VS-INSTAGRAM-FEATURES.md` with detailed comparison
- Identified all missing Twitter-like features
- Prioritized features by importance
- Created implementation plan

### 2. Database Schema Migration
- Created migration file: `src/db/migrations/002_add_twitter_features.sql`
- Added new tables:
  - `retweets` - For reposting posts
  - `hashtags` - For hashtag tracking
  - `post_hashtags` - Junction table for posts and hashtags
  - `mentions` - For @username mentions
  - `notifications` - For user notifications
  - `messages` - For direct messages
  - `blocks` - For blocking users
  - `mutes` - For muting users
- Updated existing tables:
  - Added `verified` column to `users` table
  - Added `retweet_count` column to `posts` table
  - Added `reply_to_id` column to `comments` table for threading
- Added all necessary indexes for performance

---

## 📋 Next Steps (To Be Implemented)

### Phase 1: Core Social Features

#### 1. Retweet/Repost Feature
**Files to Create:**
- `src/models/retweetModel.ts` - Database operations
- `src/services/retweetService.ts` - Business logic
- `src/controllers/retweetController.ts` - API handlers
- `src/routes/retweetRoutes.ts` - Routes

**Endpoints:**
```
POST   /api/posts/:id/repost          Repost a post
DELETE /api/posts/:id/repost          Undo repost
GET    /api/posts/:id/reposts         Get users who reposted
```

#### 2. Mentions Feature
**Files to Create:**
- `src/services/mentionService.ts` - Parse @username from text
- `src/controllers/mentionController.ts` - API handlers
- `src/routes/mentionRoutes.ts` - Routes

**Endpoints:**
```
GET    /api/mentions                  Get mentions timeline
GET    /api/users/:id/mentions        Get user mentions
```

**Integration Points:**
- Update `PostService.createPost()` to extract mentions
- Update comment creation to extract mentions
- Create mention records and notifications

#### 3. Hashtags Feature
**Files to Create:**
- `src/models/hashtagModel.ts` - Database operations
- `src/services/hashtagService.ts` - Parse #hashtag, trending
- `src/controllers/hashtagController.ts` - API handlers
- `src/routes/hashtagRoutes.ts` - Routes

**Endpoints:**
```
GET    /api/hashtags/:tag             Get posts with hashtag
GET    /api/hashtags/trending         Get trending hashtags
GET    /api/search/hashtags?q=:query  Search hashtags
```

**Integration Points:**
- Update `PostService.createPost()` to extract hashtags
- Create hashtag records and associations
- Background worker for trending hashtags

### Phase 2: Search & Discovery

#### 4. Search Functionality
**Files to Create:**
- `src/services/searchService.ts` - Full-text search logic
- `src/controllers/searchController.ts` - API handlers
- `src/routes/searchRoutes.ts` - Routes

**Endpoints:**
```
GET    /api/search/posts?q=:query     Search posts
GET    /api/search/users?q=:query     Search users
GET    /api/search/hashtags?q=:query  Search hashtags
```

**Implementation:**
- Use PostgreSQL full-text search (tsvector/tsquery)
- Or integrate Elasticsearch for advanced search
- Cache popular search queries

### Phase 3: Notifications

#### 5. Notifications System
**Files to Create:**
- `src/models/notificationModel.ts` - Database operations
- `src/services/notificationService.ts` - Business logic
- `src/controllers/notificationController.ts` - API handlers
- `src/routes/notificationRoutes.ts` - Routes
- `src/websocket/notificationSocket.ts` - WebSocket for real-time

**Endpoints:**
```
GET    /api/notifications             Get notifications
PUT    /api/notifications/:id/read    Mark as read
PUT    /api/notifications/read-all     Mark all as read
GET    /api/notifications/unread       Get unread count
```

**Integration Points:**
- Create notifications on like, comment, follow, mention, repost
- WebSocket for real-time delivery
- Background worker for notification aggregation

### Phase 4: Messaging & Privacy

#### 6. Direct Messages
**Files to Create:**
- `src/models/messageModel.ts` - Database operations
- `src/services/messageService.ts` - Business logic
- `src/controllers/messageController.ts` - API handlers
- `src/routes/messageRoutes.ts` - Routes
- `src/websocket/messageSocket.ts` - WebSocket for real-time

**Endpoints:**
```
GET    /api/messages                  Get conversations
GET    /api/messages/:userId          Get messages with user
POST   /api/messages/:userId          Send message
PUT    /api/messages/:id/read          Mark as read
```

#### 7. Block/Mute Users
**Files to Create:**
- `src/models/blockModel.ts` - Database operations
- `src/models/muteModel.ts` - Database operations
- `src/services/blockService.ts` - Business logic
- `src/services/muteService.ts` - Business logic
- `src/controllers/userController.ts` - Update with block/mute endpoints

**Endpoints:**
```
POST   /api/users/:id/block           Block user
DELETE /api/users/:id/block           Unblock user
POST   /api/users/:id/mute            Mute user
DELETE /api/users/:id/mute            Unmute user
GET    /api/users/:id/blocked         Get blocked users
```

**Integration Points:**
- Filter blocked users from feeds
- Filter muted users from notifications
- Hide blocked users' content

### Phase 5: Advanced Features

#### 8. Reply Threading
**Files to Update:**
- `src/models/commentModel.ts` - Add reply support
- `src/services/commentService.ts` - Add thread logic
- `src/controllers/commentController.ts` - Update endpoints

**Endpoints:**
```
POST   /api/posts/:id/comments        Create comment (with reply_to_id)
GET    /api/posts/:id/comments         Get comments (with threading)
GET    /api/comments/:id/replies       Get comment replies
```

#### 9. Verified Accounts
**Files to Update:**
- `src/models/userModel.ts` - Add verified field
- `src/controllers/userController.ts` - Add admin verification endpoint

**Endpoints:**
```
PUT    /api/admin/users/:id/verify     Verify user (admin only)
```

#### 10. Trending Topics
**Files to Create:**
- `src/workers/trendingWorker.ts` - Background worker
- Update `hashtagService.ts` - Add trending calculation

**Algorithm:**
- Calculate trending score based on:
  - Engagement (likes + comments + reposts)
  - Recency (time since creation)
  - Velocity (growth rate)
- Cache top 50 trending hashtags in Redis
- Update every 5 minutes

---

## 🔧 Implementation Guide

### Step 1: Run Migration
```bash
cd instagram-project
psql -U postgres -d instagram_db -f src/db/migrations/002_add_twitter_features.sql
```

### Step 2: Update TypeScript Types
Update `src/models/types.ts` to include new interfaces:
- `Retweet`
- `Hashtag`
- `Mention`
- `Notification`
- `Message`
- `Block`
- `Mute`

### Step 3: Implement Services
Start with high-priority features:
1. RetweetService
2. MentionService
3. HashtagService
4. NotificationService

### Step 4: Update Existing Services
- `PostService.createPost()` - Extract hashtags and mentions
- `CommentService.createComment()` - Extract mentions
- `LikeService` - Create notifications
- `FollowService` - Create notifications

### Step 5: Add Routes
Update `src/app.ts` to include new routes:
- Retweet routes
- Mention routes
- Hashtag routes
- Search routes
- Notification routes
- Message routes
- Block/Mute routes

### Step 6: Add WebSocket Support
Install socket.io:
```bash
npm install socket.io @types/socket.io
```

Create WebSocket server for:
- Real-time notifications
- Real-time messages

### Step 7: Update Swagger Documentation
Update `src/config/swagger.ts` with new endpoints and schemas.

---

## 📊 Database Schema Summary

### New Tables Added:
1. **retweets** - 4 columns, 3 indexes
2. **hashtags** - 4 columns, 3 indexes
3. **post_hashtags** - 2 columns, 2 indexes
4. **mentions** - 5 columns, 4 indexes
5. **notifications** - 7 columns, 4 indexes
6. **messages** - 6 columns, 3 indexes
7. **blocks** - 3 columns, 2 indexes
8. **mutes** - 3 columns, 2 indexes

### Tables Modified:
1. **users** - Added `verified` column
2. **posts** - Added `retweet_count` column
3. **comments** - Added `reply_to_id` column

**Total**: 8 new tables, 3 modified tables, 23 new indexes

---

## 🎯 Priority Order

### High Priority (Week 1-2):
1. ✅ Database schema migration
2. Retweet/Repost feature
3. Mentions feature
4. Hashtags feature

### Medium Priority (Week 3-4):
5. Search functionality
6. Notifications system

### Low Priority (Week 5+):
7. Direct Messages
8. Block/Mute users
9. Reply threading
10. Verified accounts
11. Trending topics

---

## 📝 Notes

- All features follow the same patterns as existing code
- Use Redis for caching where appropriate
- Add rate limiting for new endpoints
- Update Swagger documentation
- Add error handling and validation
- Write unit tests for new services

---

## ✅ Checklist

- [x] Feature comparison document created
- [x] Database migration file created
- [ ] Retweet service implemented
- [ ] Mention service implemented
- [ ] Hashtag service implemented
- [ ] Search service implemented
- [ ] Notification service implemented
- [ ] Message service implemented
- [ ] Block/Mute service implemented
- [ ] Reply threading implemented
- [ ] Verified accounts implemented
- [ ] Trending topics implemented
- [ ] WebSocket support added
- [ ] Swagger documentation updated
- [ ] All tests written

---

**Status**: Database schema ready. Implementation pending.

