# QuickCart - Quick Commerce Backend

Production-ready NestJS backend for 10-minute delivery platform (Zepto/Blinkit style).

## 🚀 Project Overview

QuickCart is a comprehensive quick commerce platform backend built with NestJS, PostgreSQL, and Redis. It provides APIs for product management, order processing, inventory management, delivery tracking, and real-time notifications.

## 📋 Features

- ✅ Production-ready architecture
- ✅ TypeScript strict mode
- ✅ Global error handling
- ✅ Request validation
- ✅ Rate limiting
- ✅ Health checks
- ✅ Logging system (Winston)
- ✅ Docker support
- ✅ Environment configuration
- ✅ Security headers (Helmet)
- ✅ CORS configuration

## 🛠️ Tech Stack

- **Framework**: NestJS 11+
- **Language**: TypeScript 5+ (Strict Mode)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Logging**: Winston
- **Security**: Helmet, Rate Limiting
- **Health Checks**: @nestjs/terminus

## 📦 Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd quick-commerce-backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=quickcommerce
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start Services (Docker)

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d postgres redis

# Or start all services including the app
docker-compose up
```

### 4. Run Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Verify Setup

- API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

## 📁 Project Structure

```
quick-commerce-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   ├── common/              # Shared utilities
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/   # Response interceptors
│   │   ├── pipes/          # Validation pipes
│   │   ├── logger/         # Logger service
│   │   └── health/         # Health checks
│   ├── modules/            # Feature modules (to be added)
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── logs/                   # Application logs
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
└── .env.example            # Environment variables template
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode

# Build
npm run build              # Build for production

# Testing
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
```

## 🐳 Docker

### Build and Run

```bash
# Build image
docker build -t quick-commerce-backend .

# Run container
docker run -p 3000:3000 --env-file .env quick-commerce-backend

# Or use Docker Compose
docker-compose up
```

## 📊 Health Checks

The application includes health check endpoints:

- **Health**: `GET /health`
  - Checks memory usage
  - Checks disk storage
  - Returns application status

## 🔒 Security Features

- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention (TypeORM)
- ✅ XSS protection

## 📝 Day 1 Setup Complete

✅ Project initialized with NestJS
✅ TypeScript strict mode enabled
✅ Configuration management setup
✅ Winston logger configured
✅ Global exception filter
✅ Global validation pipe
✅ Global response interceptor
✅ Health check module
✅ Docker setup
✅ Environment configuration

## 🗓️ Next Steps (Day 2)

- Database schema setup
- TypeORM entities
- Database migrations
- Seed data scripts

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Winston Documentation](https://github.com/winstonjs/winston)

## 📄 License

This project is private and proprietary.

## 👥 Team

QuickCart Development Team

---

**Status**: Day 1 Complete ✅
**Next**: Day 2 - Database Setup & Migrations
