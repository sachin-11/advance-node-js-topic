# Twitter Service

A production-ready Twitter-like social media service built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- **User Management**: Registration, authentication, profile management
- **Tweets**: Create, read, delete tweets with hashtag support
- **Social Features**: Follow/unfollow users, like tweets
- **Timeline**: Personalized home timeline and user timelines
- **Real-time**: Redis caching for fast performance
- **Rate Limiting**: Token bucket rate limiter (100 req/min)
- **API Documentation**: Interactive Swagger/OpenAPI docs

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (persistence)
- **Cache**: Redis (caching + rate limiting)
- **Authentication**: JWT tokens
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
cd twitter-project
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the values in `.env` with your configuration.

### 3. Create PostgreSQL Database

```bash
createdb twitter
# Or using psql:
# psql -U postgres
# CREATE DATABASE twitter;
```

### 4. Run Database Migration

```bash
psql -U postgres -d twitter -f src/db/schema.sql
```

Or use the setup script:

```bash
npm run setup-db
```

### 5. Start PostgreSQL and Redis

Make sure both services are running:

```bash
# PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Redis (macOS with Homebrew)
brew services start redis

# Or using Docker:
# docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
# docker run -d -p 6379:6379 redis
```

### 6. Start the Application

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`.

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/tweets` - Get user's tweets
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers list
- `GET /api/users/:id/following` - Get following list
- `GET /api/users/search?q=query` - Search users

### Tweets
- `POST /api/tweets` - Create new tweet
- `GET /api/tweets/:id` - Get tweet details
- `DELETE /api/tweets/:id` - Delete tweet
- `GET /api/tweets/:id/replies` - Get tweet replies

### Timeline
- `GET /api/timeline/home` - Get home timeline
- `GET /api/timeline/user/:id` - Get user timeline

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
twitter-project/
├── src/
│   ├── app.ts                  # Express app entry point
│   ├── config/
│   │   ├── database.ts         # PostgreSQL configuration
│   │   ├── redis.ts            # Redis configuration
│   │   └── swagger.ts          # Swagger configuration
│   ├── controllers/            # (Future: separate controllers)
│   ├── services/
│   │   ├── authService.ts      # Authentication logic
│   │   ├── userService.ts      # User management
│   │   ├── tweetService.ts     # Tweet operations
│   │   ├── followService.ts    # Follow relationships
│   │   └── timelineService.ts  # Timeline generation
│   ├── routes/
│   │   ├── authRoutes.ts       # Auth endpoints
│   │   ├── userRoutes.ts       # User endpoints
│   │   ├── tweetRoutes.ts      # Tweet endpoints
│   │   └── timelineRoutes.ts   # Timeline endpoints
│   ├── middlewares/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   └── errorHandler.ts     # Error handling
│   ├── models/
│   │   └── types.ts            # TypeScript types
│   ├── utils/
│   │   ├── hashtagExtractor.ts # Hashtag extraction
│   │   └── mentionExtractor.ts # Mention extraction
│   └── db/
│       └── schema.sql          # Database schema
├── scripts/
│   └── setup-db.ts             # Database setup script
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run database setup
npm run setup-db
```

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "display_name": "Test User"
  }'
```

### Create a Tweet
```bash
curl -X POST http://localhost:3000/api/tweets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "content": "Hello Twitter! #FirstTweet"
  }'
```

### Get Home Timeline
```bash
curl http://localhost:3000/api/timeline/home \
  -H "Authorization: Bearer <your-token>"
```

## Architecture Highlights

- **Fast Performance**: Redis cache for sub-100ms response times
- **Scalable**: Designed for horizontal scaling with sharding strategy
- **Secure**: JWT authentication, rate limiting, input validation
- **Maintainable**: Clean architecture with service layer pattern
- **Observable**: Structured logging and health check endpoints

## Database Schema

The system uses 9 main tables:
- `users` - User accounts and profiles
- `tweets` - Tweet content and metadata
- `follows` - Follow relationships
- `likes` - Tweet likes
- `retweets` - Retweets
- `hashtags` - Hashtag tracking
- `tweet_hashtags` - Tweet-hashtag relationships
- `notifications` - User notifications
- `direct_messages` - Direct messaging

## Caching Strategy

- **User profiles**: 1 hour TTL
- **Tweets**: 1 hour TTL
- **Timelines**: 5 minutes TTL
- **Rate limits**: 1 minute window

## License

MIT
