# TinyURL Service

A production-ready URL shortening service built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- **URL Shortening**: Convert long URLs to short codes using base62 encoding
- **Custom Aliases**: Support for custom short codes (alphanumeric + -/_)
- **Expiration**: Optional expiration dates for shortened URLs
- **Click Tracking**: Asynchronous click counting with Redis caching
- **Rate Limiting**: Token bucket rate limiter using Redis (100 req/min per IP)
- **Caching**: Redis cache for fast redirect lookups
- **Statistics**: Get URL stats including click counts and creation dates

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (persistence)
- **Cache**: Redis (caching + rate limiting)
- **Encoding**: Base62 for short code generation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database and Redis credentials:

```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=tinyurl
PG_USER=postgres
PG_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

PORT=3000
BASE_URL=https://my.tiny
```

### 3. Create PostgreSQL Database

```bash
createdb tinyurl
# Or using psql:
# psql -U postgres
# CREATE DATABASE tinyurl;
```

### 4. Run Database Migration

```bash
npm run migrate
```

Or manually run the migration:

```bash
psql -U postgres -d tinyurl -f migrations/001_create_urls_table.sql
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

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

The Swagger UI provides an interactive interface to test all API endpoints directly from your browser.

## API Endpoints

### 1. Shorten URL

**POST** `/api/shorten`

Request body:
```json
{
  "longUrl": "https://example.com/very/long/url",
  "customAlias": "my-link",  // Optional
  "expireAt": "2024-12-31T23:59:59Z"  // Optional
}
```

Response:
```json
{
  "shortUrl": "https://my.tiny/abc123"
}
```

### 2. Redirect to Long URL

**GET** `/:code`

Redirects (302) to the original long URL and increments click count asynchronously.

Example: `GET /abc123` → redirects to original URL

### 3. Get URL Statistics

**GET** `/api/stats/:code`

Response:
```json
{
  "longUrl": "https://example.com/very/long/url",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "clickCount": 42,
  "expireAt": "2024-12-31T23:59:59.000Z"  // or null
}
```

## How It Works

### Redirect Flow

1. **Client Request**: User visits `https://my.tiny/abc123`
2. **Cache Check**: Server checks Redis for `url:abc123`
3. **Cache Hit**: If found, return cached long URL immediately
4. **Cache Miss**: If not found, query PostgreSQL for the long URL
5. **Cache Update**: Store the mapping in Redis for future requests (1 hour TTL)
6. **Click Tracking**: Asynchronously increment click counter in Redis (`clicks:abc123`)
7. **Redirect**: Return 302 redirect to the long URL
8. **Background Worker**: Every 10 seconds, flush accumulated click counts from Redis to PostgreSQL

### Short Code Generation

- Uses PostgreSQL `SERIAL` (auto-incrementing) ID
- Encodes the ID to base62 (0-9, a-z, A-Z)
- Example: ID `12345` → `dnh` (base62)
- Custom aliases are validated and checked for uniqueness

### Architecture Highlights

- **Fast Redirects**: Redis cache provides sub-millisecond lookup times
- **Scalable Click Counting**: Redis counters are batched and flushed to PostgreSQL every 10 seconds
- **Rate Limiting**: Token bucket algorithm prevents abuse (100 req/min per IP)
- **Collision Handling**: Custom aliases are checked for uniqueness before insertion
- **Expiration Support**: Expired URLs return 404 on access

## Project Structure

```
.
├── src/
│   ├── server.ts              # Express app entry point
│   ├── controllers/
│   │   └── urlController.ts   # Route handlers
│   ├── services/
│   │   └── urlService.ts      # Business logic
│   ├── db/
│   │   └── pg.ts              # PostgreSQL client
│   ├── cache/
│   │   └── redis.ts           # Redis client
│   ├── utils/
│   │   └── base62.ts          # Base62 encoding utility
│   ├── middleware/
│   │   └── rateLimiter.ts     # Rate limiting middleware
│   └── workers/
│       └── clickCountWorker.ts # Background worker
├── migrations/
│   └── 001_create_urls_table.sql
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

```bash
# Shorten a URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com"}'

# Get stats
curl http://localhost:3000/api/stats/abc123

# Visit short URL (will redirect)
curl -L http://localhost:3000/abc123
```

## License

MIT
