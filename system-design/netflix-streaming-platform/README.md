# Netflix Streaming Platform

A production-ready Netflix-like video streaming platform built with Node.js, TypeScript, PostgreSQL, Redis, and Elasticsearch.

## Features

- ✅ User authentication and authorization with JWT
- ✅ Multiple user profiles per account
- ✅ Content management (Movies, TV Shows, Episodes)
- ✅ Video streaming with HLS/DASH support
- ✅ Adaptive bitrate streaming
- ✅ Watch history and continue watching
- ✅ Personalized recommendations
- ✅ Full-text search with Elasticsearch
- ✅ Content ratings and reviews
- ✅ Offline content download
- ✅ CDN integration for global distribution
- ✅ Real-time analytics and monitoring

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Databases**:
  - PostgreSQL (Primary database)
  - Redis (Caching & sessions)
  - Cassandra (Watch history - time series)
  - Elasticsearch (Search)
- **Storage**: AWS S3 / Google Cloud Storage
- **Video Processing**: FFmpeg, AWS MediaConvert
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Load Balancer │    │   Application   │
│                 │    │                 │    │   Servers       │
│ - Web App       │────▶│ - SSL Term.    │────▶│ - API Service  │
│ - Mobile Apps   │    │ - Health Checks │    │ - Auth Service  │
│ - Smart TV      │    │                 │    │ - Content Svc   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Cassandra     │
│   (Primary)     │    │   (Cache)       │    │ (Watch History) │
│                 │    │                 │    │                 │
│ - Users         │    │ - Content Meta  │    │ - Watch Events  │
│ - Content       │    │ - Sessions      │    │ - Analytics     │
│ - Profiles      │    │ - Recommendations│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      CDN        │    │   Origin S3     │    │ Video Processing│
│  (Edge Cache)   │    │   Storage       │    │                 │
│                 │    │                 │    │ - Transcoding   │
│ - Global Dist.  │    │ - Raw Videos    │    │ - HLS/DASH      │
│ - Cache Miss    │    │ - Encoded Seg.  │    │ - Multiple Res. │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+
- Cassandra 4+ (optional, for watch history)
- AWS S3 account (for video storage)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd netflix-streaming-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up databases
```bash
npm run setup-db
```

5. Run migrations
```bash
npm run migrate
```

6. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Documentation

API documentation is available at `http://localhost:3000/api-docs` when the server is running.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `AWS_S3_BUCKET` | S3 bucket name | - |
| `ELASTICSEARCH_NODE` | Elasticsearch node URL | http://localhost:9200 |

## Project Structure

```
netflix-streaming-platform/
├── src/
│   ├── config/           # Database, Redis, S3 configurations
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models and types
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── workers/         # Background jobs
├── scripts/             # Setup and utility scripts
├── docs/               # Documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run setup-db` - Set up databases
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.