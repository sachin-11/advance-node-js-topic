# Instagram Service

A production-ready Instagram-like social media platform built with Node.js, TypeScript, Express, PostgreSQL, Redis, and AWS S3.

## Features

- **User Authentication**: Register, login with JWT tokens
- **Photo Upload**: Upload photos with automatic thumbnail generation
- **Image Processing**: Multiple sizes (thumbnail, medium, large) with Sharp
- **S3 Storage**: Store images in AWS S3 with CDN support
- **Follow/Unfollow**: User relationship management
- **Feed Generation**: Chronological and algorithmic feeds
- **Feed Caching**: Redis-based feed caching for fast retrieval
- **Rate Limiting**: Upload, follow, and API rate limits

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (persistence)
- **Cache**: Redis (feed caching + rate limiting)
- **Storage**: AWS S3 (image storage)
- **Image Processing**: Sharp
- **Authentication**: JWT

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- AWS S3 bucket (for image storage)

## Setup Instructions

### 1. Install Dependencies

```bash
cd instagram-project
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

**For Local Storage (Recommended for Development):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=instagram_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

# Use local storage (no AWS S3 needed)
USE_S3=false
UPLOADS_DIR=uploads
BASE_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

PORT=3000
```

**For AWS S3 (Production):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=instagram_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

# Use AWS S3
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=instagram-photos
S3_CDN_URL=https://cdn.instagram.com

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

PORT=3000
BASE_URL=http://localhost:3000
```

**Note:** By default, the app uses **local storage** (no AWS S3 required). Set `USE_S3=true` only if you want to use AWS S3.

### 3. Create PostgreSQL Database and Run Migrations

**Option 1: Use the setup script (Recommended)**

```bash
npm run setup-db
```

**Option 2: Manual setup**

```bash
# Create database
createdb -U postgres instagram_db

# Run migrations
npm run migrate
# Or manually:
# psql -U postgres -d instagram_db -f src/db/schema.sql
```

**Option 3: Use shell script**

```bash
./scripts/setup-db.sh
```

### 5. Start Services

```bash
# PostgreSQL
brew services start postgresql@15

# Redis
brew services start redis
```

### 6. Start the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Documentation (Swagger/RapidDocs)

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### How to Test APIs in Swagger UI:

1. **Start the server**: `npm run dev`
2. **Open Swagger UI**: http://localhost:3000/api-docs
3. **Register a user**: Use `/api/auth/register` endpoint
4. **Login**: Use `/api/auth/login` endpoint to get JWT token
5. **Authorize**: Click the "Authorize" button at the top, paste your JWT token
6. **Test endpoints**: All protected endpoints will now work with your token

### Testing File Upload:

For testing photo upload (`POST /api/posts`):
- Swagger UI supports file uploads
- Click "Try it out"
- Click "Choose File" and select an image
- Add caption (optional)
- Click "Execute"

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers list
- `GET /api/users/:id/following` - Get following list

### Posts

- `POST /api/posts` - Create new post (multipart/form-data with image)
- `GET /api/posts/:id` - Get post details
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/users/:id/posts` - Get user's posts

### Feed

- `GET /api/feed` - Get chronological feed
- `GET /api/feed/algorithmic` - Get algorithmic feed

### Health

- `GET /health` - Health check

## API Documentation

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## Example Usage

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "bio": "Photography enthusiast"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "caption=My first post!"
```

### Get Feed

```bash
curl -X GET http://localhost:3000/api/feed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Rate Limits

- **API Requests**: 100 requests per minute per IP
- **Post Uploads**: 10 posts per hour per user
- **Follow Actions**: 100 follows per day per user

## Project Structure

```
instagram-project/
├── src/
│   ├── app.ts                    # Express app
│   ├── config/
│   │   ├── database.ts           # PostgreSQL client
│   │   ├── redis.ts              # Redis client
│   │   ├── s3.ts                 # AWS S3 client
│   │   └── swagger.ts            # Swagger config
│   ├── controllers/
│   │   ├── authController.ts     # Auth endpoints
│   │   ├── userController.ts     # User endpoints
│   │   ├── postController.ts     # Post endpoints
│   │   └── feedController.ts     # Feed endpoints
│   ├── services/
│   │   ├── authService.ts        # Authentication logic
│   │   ├── postService.ts        # Post operations
│   │   ├── followService.ts      # Follow/unfollow logic
│   │   ├── feedService.ts        # Feed generation
│   │   ├── imageProcessingService.ts  # Image processing
│   │   └── storageService.ts     # S3 operations
│   ├── models/
│   │   ├── userModel.ts
│   │   ├── postModel.ts
│   │   └── followModel.ts
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── upload.ts             # Multer config
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── errorHandler.ts       # Error handling
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── postRoutes.ts
│   │   └── feedRoutes.ts
│   ├── workers/
│   │   └── feedRefreshWorker.ts  # Background feed updates
│   └── db/
│       └── schema.sql            # Database schema
```

## License

MIT

