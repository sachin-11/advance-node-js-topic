# Pastebin Service

A production-ready pastebin service built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- **Paste Creation**: Create text/code pastes with syntax highlighting
- **Syntax Highlighting**: Support for 100+ programming languages
- **Privacy Controls**: Public, private, and unlisted pastes
- **Password Protection**: Optional password protection for pastes
- **Expiration**: Time-based and view-based expiration
- **Burn After Reading**: One-time view option
- **View Tracking**: Asynchronous view count tracking with Redis caching
- **Rate Limiting**: Token bucket rate limiter using Redis (100 req/min per IP)
- **Caching**: Redis cache for fast paste retrieval
- **Statistics**: Get paste stats including view counts

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (persistence)
- **Cache**: Redis (caching + rate limiting)
- **Syntax Highlighting**: Highlight.js
- **Encoding**: Base62 for paste ID generation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
cd pastebin-project
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database and Redis credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pastebin_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

PORT=3000
BASE_URL=http://localhost:3000
```

### 3. Create PostgreSQL Database

```bash
createdb pastebin_db
# Or using psql:
# psql -U postgres
# CREATE DATABASE pastebin_db;
```

### 4. Run Database Migration

```bash
npm run migrate
```

Or manually run the migration:

```bash
psql -U postgres -d pastebin_db -f src/db/schema.sql
```

### 5. Start PostgreSQL and Redis

Make sure both services are running:

```bash
# PostgreSQL (macOS with Homebrew)
brew services start postgresql@15

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

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation (Swagger/RapidDocs)

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

The Swagger UI allows you to:
- View all available endpoints
- Test API endpoints directly from the browser
- See request/response schemas
- Try out different parameters

## API Endpoints

### 1. Create Paste

**POST** `/api/paste`

Request body:
```json
{
  "content": "print('Hello World')",
  "title": "My Python Code",
  "language": "python",
  "privacy": "public",
  "password": "optional_password",
  "expires_in": 3600,
  "max_views": 100,
  "burn_after_reading": false
}
```

Response:
```json
{
  "paste_id": "abc123",
  "url": "http://localhost:3000/paste/abc123",
  "expires_at": "2024-12-08T12:00:00.000Z",
  "created_at": "2024-12-07T12:00:00.000Z"
}
```

### 2. Get Paste (JSON)

**GET** `/api/paste/:id`

Query parameters:
- `password` - Password if paste is password protected
- `raw` - Set to `true` to get raw text (no JSON)

Response:
```json
{
  "paste_id": "abc123",
  "title": "My Python Code",
  "content": "print('Hello World')",
  "language": "python",
  "privacy": "public",
  "view_count": 42,
  "created_at": "2024-12-07T12:00:00.000Z",
  "expires_at": "2024-12-08T12:00:00.000Z"
}
```

### 3. View Paste (HTML with Syntax Highlighting)

**GET** `/paste/:id` or `/api/paste/:id/view`

Query parameters:
- `password` - Password if paste is password protected

Returns HTML page with syntax highlighted code.

### 4. Get Paste Statistics

**GET** `/api/paste/:id/stats`

Response:
```json
{
  "paste_id": "abc123",
  "view_count": 42,
  "created_at": "2024-12-07T12:00:00.000Z",
  "expires_at": "2024-12-08T12:00:00.000Z"
}
```

### 5. View Paste (HTML with Syntax Highlighting)

**GET** `/paste/:id` or `/api/paste/:id/view`

Query parameters:
- `password` - Password if paste is password protected

Returns HTML page with syntax highlighted code.

### 6. Health Check

**GET** `/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-07T12:00:00.000Z",
  "redis": "connected"
}
```

## How It Works

### Paste Creation Flow

1. **User Request**: POST `/api/paste` with content
2. **Validation**: Content validation and malicious content check
3. **ID Generation**: Generate unique paste ID using Base62 encoding
4. **Storage**: Store in PostgreSQL (small content) or prepare for S3 (large content)
5. **Caching**: Cache in Redis for fast retrieval
6. **Response**: Return paste URL

### Paste Retrieval Flow

1. **User Request**: GET `/paste/:id`
2. **Cache Check**: Check Redis for cached paste
3. **Cache Hit**: Return cached paste immediately
4. **Cache Miss**: Query PostgreSQL for paste
5. **Access Control**: Check password, privacy, expiration
6. **Syntax Highlighting**: Apply syntax highlighting if language specified
7. **View Tracking**: Asynchronously increment view count
8. **Response**: Return HTML with highlighted code or JSON

### Background Workers

1. **View Count Worker**: Flushes view counts from Redis to PostgreSQL every 10 seconds
2. **Expiration Cleanup Worker**: Removes expired pastes every hour

## Supported Languages

All languages supported by Highlight.js:
- Python, JavaScript, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, and 100+ more

## Privacy Options

- **public**: Anyone with the link can view
- **private**: Only creator can view (requires authentication)
- **unlisted**: Not in public listing, but accessible via link

## Expiration Options

- **Time-based**: Expires after specified time (seconds)
- **View-based**: Expires after N views
- **Burn after reading**: Deletes after first view

## Project Structure

```
pastebin-project/
├── src/
│   ├── app.ts                 # Express app entry point
│   ├── config/
│   │   ├── database.ts        # PostgreSQL client
│   │   └── redis.ts           # Redis client
│   ├── controllers/
│   │   └── pasteController.ts # Route handlers
│   ├── services/
│   │   ├── pasteService.ts    # Business logic
│   │   └── securityService.ts # Security operations
│   ├── models/
│   │   ├── pasteModel.ts      # Database model
│   │   └── types.ts           # TypeScript interfaces
│   ├── middleware/
│   │   ├── rateLimiter.ts     # Rate limiting middleware
│   │   └── index.ts           # Other middlewares
│   ├── routes/
│   │   └── pasteRoutes.ts     # API routes
│   ├── workers/
│   │   ├── expirationCleanupWorker.ts # Cleanup expired pastes
│   │   └── viewCountWorker.ts        # Flush view counts
│   ├── utils/
│   │   ├── base62.ts          # Base62 encoding
│   │   └── idGenerator.ts     # Paste ID generation
│   └── db/
│       └── schema.sql         # Database schema
├── public/
│   └── index.html             # Frontend (optional)
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

# Run migrations
npm run migrate
```

## Testing the API

### Using Swagger UI (Recommended)

1. Start the server: `npm run dev`
2. Open browser: http://localhost:3000/api-docs
3. Click on any endpoint to expand it
4. Click "Try it out" button
5. Fill in the parameters and click "Execute"
6. See the response directly in the browser

### Using cURL

```bash
# Create a paste
curl -X POST http://localhost:3000/api/paste \
  -H "Content-Type: application/json" \
  -d '{
    "content": "print(\"Hello World\")",
    "language": "python",
    "title": "My Code"
  }'

# Get paste (JSON)
curl http://localhost:3000/api/paste/abc123

# View paste (HTML with syntax highlighting)
curl http://localhost:3000/paste/abc123

# Get stats
curl http://localhost:3000/api/paste/abc123/stats
```

## Features Implemented

✅ Paste creation with Base62 ID generation
✅ Syntax highlighting (100+ languages)
✅ Password protection
✅ Privacy controls (public/private/unlisted)
✅ Expiration (time-based and view-based)
✅ Burn after reading
✅ View count tracking
✅ Redis caching
✅ Rate limiting
✅ Background workers
✅ Error handling
✅ Input validation

## License

MIT

