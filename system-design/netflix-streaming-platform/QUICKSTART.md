# 🚀 Netflix Streaming Platform - Quick Start Guide

## ⚡ 5-Minute Setup (Windows)

### 1. Prerequisites Check
```bash
# Required software (install if missing):
# - Node.js 18+ (check: node --version)
# - PostgreSQL 15+ (check: psql --version)
# - Redis 7+ (check: redis-cli --version)
node --version
```

### 2. Project Setup
```bash
cd system-design/netflix-streaming-platform

# Install dependencies
npm install

# Copy environment file
copy env.example .env

# Edit .env file with your settings
notepad .env
```

### 3. Database Setup
```bash
# Start PostgreSQL service (if using Windows service)
# Or start manually: pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"

# Setup database
npm run setup-db

# Optional: Add sample data
npm run setup-db -- --seed
```

### 4. Redis Setup
```bash
# Start Redis server
redis-server

# Or if installed as Windows service, start it
```

### 5. Environment Configuration
Edit `.env` file with:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=netflix_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
```

### 6. Start Application
```bash
# Development mode (auto-restart)
npm run dev

# Production build
npm run build
npm start
```

### 7. Test API
```bash
# Health check
curl http://localhost:3000/health

# API Documentation
# Open: http://localhost:3000/api-docs

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 🏗️ Project Structure
```
netflix-streaming-platform/
├── src/
│   ├── config/          # Database, Redis, Swagger configs
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/         # TypeScript types & interfaces
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic (auth, content, etc.)
│   ├── utils/          # Helper functions
│   └── db/             # Database schema & migrations
├── scripts/            # Setup & utility scripts
└── docs/              # Documentation
```

## 🔑 Available API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

### Content (Coming Soon)
- `GET /api/content/browse` - Browse content
- `GET /api/content/search` - Search content
- `GET /api/content/{id}` - Get content details

### User Management
- `GET /api/user/profiles` - Get user profiles
- `POST /api/user/profiles` - Create profile
- `GET /api/user/watch-history` - Get watch history

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts
- `profiles` - User profiles (multiple per account)
- `content` - Movies, TV shows, episodes
- `categories` - Content categories/genres
- `watch_history` - User viewing history
- `ratings` - User ratings & reviews

**Relationships:**
- User → Profiles (1:many)
- Content → Categories (many:many)
- Profile → Watch History (1:many)
- Profile → Ratings (1:many)

## 🔧 Troubleshooting

### Common Issues:

**1. PostgreSQL Connection Error**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Create database manually if needed
createdb netflix_db
```

**2. Redis Connection Error**
```bash
# Check Redis status
redis-cli ping

# Start Redis server
redis-server
```

**3. Port Already in Use**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**4. Permission Errors**
```bash
# Run as administrator or check folder permissions
# Ensure write access to project directory
```

## 📊 Features Implemented

✅ **Authentication System**
- JWT-based authentication
- User registration & login
- Multiple user profiles
- Password reset functionality
- Email verification (framework ready)

✅ **Database Layer**
- PostgreSQL with optimized schema
- Redis caching
- Connection pooling
- Database migrations

✅ **API Framework**
- RESTful API design
- Input validation
- Error handling
- Rate limiting
- Swagger documentation

✅ **Security**
- bcrypt password hashing
- JWT token management
- CORS configuration
- Helmet security headers
- Input sanitization

## 🚀 Next Steps

1. **Content Management**: Add movie/TV show catalog
2. **Video Streaming**: Implement HLS/DASH streaming
3. **Recommendations**: Build ML-based recommendations
4. **Search**: Add Elasticsearch integration
5. **Frontend**: Create React/Vue.js client
6. **CDN**: Integrate CloudFront/AWS S3

## 📞 Support

- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Logs**: Check console output for errors

---

**🎬 Ready to stream? Your Netflix-like platform is now running!**