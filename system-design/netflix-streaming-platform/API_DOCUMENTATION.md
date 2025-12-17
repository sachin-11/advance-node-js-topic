# 📚 Netflix Streaming Platform - Complete API Documentation

## 🔗 Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.netflix-platform.com`

## 📖 Swagger UI
Access interactive API documentation at: `http://localhost:3000/api-docs`

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "country": "USA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "profile": { ... },
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

### POST `/api/auth/login`
Login with email and password.

### POST `/api/auth/refresh`
Refresh access token using refresh token.

### POST `/api/auth/logout`
Logout and invalidate tokens.

### POST `/api/auth/change-password`
Change user password.

---

## 👤 User Management Endpoints

### GET `/api/user/profiles`
Get all profiles for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John's Profile",
      "avatar_url": "...",
      "is_kids_profile": false,
      "language": "en",
      "autoplay": true
    }
  ],
  "count": 1
}
```

### POST `/api/user/profiles`
Create a new profile.

**Request Body:**
```json
{
  "name": "Kids Profile",
  "is_kids_profile": true,
  "pin_code": "1234",
  "language": "en",
  "autoplay": false
}
```

### GET `/api/user/profiles/:profileId`
Get profile by ID.

### PUT `/api/user/profiles/:profileId`
Update profile details.

### DELETE `/api/user/profiles/:profileId`
Delete a profile.

---

## 📺 Content Endpoints

### GET `/api/content/browse`
Browse content with filters.

**Query Parameters:**
- `category_id` (optional): Filter by category
- `content_type` (optional): Filter by type (movie, tv_show, episode)
- `limit` (default: 20): Number of results
- `offset` (default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "The Matrix",
      "content_type": "movie",
      "poster_url": "...",
      "duration_minutes": 136,
      "genres": ["Action", "Sci-Fi"],
      "avg_rating": 4.5
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

### GET `/api/content/:id`
Get detailed content information.

**Response includes:**
- Content metadata
- Categories
- Video files (all qualities)
- TV show info and episodes (if TV show)
- Average rating and rating count

### GET `/api/content/categories`
Get all active categories.

### GET `/api/content/categories/:categoryId/content`
Get content filtered by category.

### GET `/api/content/trending`
Get trending content (based on views in last 7 days).

---

## 🔍 Search Endpoints

### GET `/api/search`
Search content by query.

**Query Parameters:**
- `q` (required): Search query
- `content_type` (optional): Filter by type
- `genre` (optional): Filter by genre
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "query": "matrix",
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

**Search Features:**
- Full-text search on title and description
- Fuzzy matching on cast names
- Genre filtering
- Content type filtering

---

## 📹 Streaming Endpoints

### GET `/api/streaming/manifest/:contentId`
Get streaming manifest (HLS/DASH) for content.

**Query Parameters:**
- `episode_id` (optional): For TV show episodes
- `quality` (default: 720p): Video quality (240p, 360p, 480p, 720p, 1080p, 4k, 8k)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "manifest_url": "https://cdn.example.com/video.m3u8",
    "content_info": { ... },
    "video_file": {
      "quality": "720p",
      "protocol": "hls",
      "duration_seconds": 8160,
      "bitrate_kbps": 5000
    },
    "available_qualities": ["240p", "360p", "480p", "720p", "1080p"]
  }
}
```

**Features:**
- Automatic quality selection
- Adaptive bitrate streaming support
- View analytics tracking
- Device detection

### GET `/api/streaming/qualities/:contentId`
Get available video qualities for content.

---

## 📊 Watch History Endpoints

### GET `/api/user/watch-history`
Get watch history for current profile.

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content_id": "uuid",
      "title": "The Matrix",
      "poster_url": "...",
      "watch_duration_seconds": 3600,
      "total_duration_seconds": 8160,
      "completion_percentage": 44.12,
      "watched_at": "2025-12-17T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST `/api/user/watch-history`
Update watch progress.

**Request Body:**
```json
{
  "content_id": "uuid",
  "episode_id": "uuid",  // Optional for TV shows
  "watch_duration_seconds": 3600,
  "total_duration_seconds": 8160,
  "device_type": "mobile",
  "device_id": "device_unique_id"
}
```

### GET `/api/user/continue-watching`
Get continue watching content (incomplete watches).

**Response:** List of content with progress < 90%

### DELETE `/api/user/watch-history/:contentId`
Remove content from watch history.

---

## ⭐ Rating Endpoints

### POST `/api/content/:contentId/rating`
Rate content.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating_type": "star_rating",  // or "thumbs_up", "thumbs_down"
  "rating_value": 5,  // Required for star_rating (1-5)
  "review_text": "Great movie!",
  "is_public": true
}
```

### GET `/api/content/:contentId/rating`
Get user's rating for content (requires auth).

### GET `/api/content/:contentId/ratings`
Get all public ratings for content.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "profile_name": "John",
      "rating_type": "star_rating",
      "rating_value": 5,
      "review_text": "Amazing!",
      "created_at": "2025-12-17T10:00:00Z"
    }
  ],
  "summary": {
    "avg_rating": 4.5,
    "total_ratings": 1250
  },
  "pagination": { ... }
}
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "statusCode": 400
}
```

---

## 🔒 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Token Expiration:**
- Access Token: 1 hour
- Refresh Token: 7 days

---

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🚀 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers

---

## 📊 Database Schema Mapping

### Users & Profiles
- `users` table → `/api/auth/*`, `/api/user/profiles`
- `profiles` table → `/api/user/profiles/*`

### Content
- `content` table → `/api/content/*`
- `categories` table → `/api/content/categories`
- `tv_shows` table → `/api/content/:id` (when content_type = tv_show)
- `episodes` table → `/api/content/:id` (episodes included)
- `video_files` table → `/api/streaming/*`

### User Interactions
- `watch_history` table → `/api/user/watch-history`
- `ratings` table → `/api/content/:id/rating`
- `user_lists` table → (Coming soon)
- `downloads` table → (Coming soon)

### Analytics
- `content_views` table → Auto-tracked on streaming
- `user_sessions` table → Auto-tracked

---

## 🎯 Complete API Flow Example

### 1. Register User
```bash
POST /api/auth/register
→ Returns: user, profile, tokens
```

### 2. Browse Content
```bash
GET /api/content/browse?category_id=uuid
→ Returns: List of content
```

### 3. Get Content Details
```bash
GET /api/content/{contentId}
→ Returns: Full content details with video files
```

### 4. Start Streaming
```bash
GET /api/streaming/manifest/{contentId}?quality=720p
→ Returns: Manifest URL and video info
```

### 5. Update Watch Progress
```bash
POST /api/user/watch-history
Body: { content_id, watch_duration_seconds, total_duration_seconds }
→ Updates watch history
```

### 6. Rate Content
```bash
POST /api/content/{contentId}/rating
Body: { rating_type: "star_rating", rating_value: 5 }
→ Creates/updates rating
```

---

## 📱 Next Steps

1. **User Lists API** - My List, Watch Later
2. **Download API** - Offline content downloads
3. **Recommendations API** - Personalized recommendations
4. **Notifications API** - User notifications
5. **Payment API** - Subscription management

---

**🎬 All APIs are documented in Swagger UI at `/api-docs`**