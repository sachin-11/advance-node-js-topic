# Docker Setup Guide - Quick Commerce Backend

## 🐳 Docker Commands

### Quick Start

```powershell
# Start all services (PostgreSQL, Redis, App)
npm run docker:start

# Check server status
npm run docker:check

# View logs
npm run docker:logs

# Stop all services
npm run docker:stop
```

### Manual Docker Commands

```powershell
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Check container status
docker-compose ps

# Restart a service
docker-compose restart app

# Stop a specific service
docker-compose stop postgres
```

### PowerShell Scripts

```powershell
# Start services
.\scripts\docker-start.ps1

# Check server status
.\scripts\check-server.ps1

# Stop services
.\scripts\docker-stop.ps1

# View logs
.\scripts\docker-logs.ps1

# View logs for specific service
.\scripts\docker-logs.ps1 -Service app
```

## 📋 Services

### 1. PostgreSQL Database
- **Container**: `quick-commerce-postgres`
- **Port**: `5432`
- **Database**: `quickcommerce`
- **Username**: `postgres`
- **Password**: `postgres`

### 2. Redis Cache
- **Container**: `quick-commerce-redis`
- **Port**: `6379`

### 3. Application
- **Container**: `quick-commerce-backend`
- **Port**: `3000`
- **API**: `http://localhost:3000/api`
- **Health**: `http://localhost:3000/health`

## ✅ Check Server Status

### Method 1: Using Script
```powershell
npm run docker:check
# or
.\scripts\check-server.ps1
```

### Method 2: Manual Check

```powershell
# Check containers
docker-compose ps

# Check API health
curl http://localhost:3000/health
# or in browser: http://localhost:3000/health

# Check PostgreSQL
docker exec quick-commerce-postgres pg_isready -U postgres

# Check Redis
docker exec quick-commerce-redis redis-cli ping
```

## 🔧 Troubleshooting

### Services Not Starting

1. **Check Docker Desktop is running**
   ```powershell
   docker --version
   ```

2. **Check if ports are already in use**
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :5432
   netstat -ano | findstr :6379
   ```

3. **View logs for errors**
   ```powershell
   docker-compose logs
   ```

4. **Rebuild containers**
   ```powershell
   docker-compose down
   docker-compose up -d --build
   ```

### Database Connection Issues

```powershell
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Access PostgreSQL shell
docker exec -it quick-commerce-postgres psql -U postgres -d quickcommerce
```

### Redis Connection Issues

```powershell
# Check Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis

# Access Redis CLI
docker exec -it quick-commerce-redis redis-cli
```

### Application Issues

```powershell
# Check application logs
docker-compose logs app

# Restart application
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app
```

## 🗑️ Clean Up

```powershell
# Stop and remove containers
docker-compose down

# Remove containers and volumes (⚠️ deletes database data)
docker-compose down -v

# Remove all related images
docker-compose down --rmi all
```

## 📝 Environment Variables

Docker Compose uses environment variables defined in `docker-compose.yml`. For local development, you can override them by creating a `.env` file:

```env
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=quickcommerce
REDIS_HOST=redis
REDIS_PORT=6379
```

## 🚀 Development Workflow

1. **Start services**
   ```powershell
   npm run docker:start
   ```

2. **Wait for services to be ready** (about 10-15 seconds)

3. **Check status**
   ```powershell
   npm run docker:check
   ```

4. **View logs** (optional)
   ```powershell
   npm run docker:logs
   ```

5. **Access API**
   - Health: http://localhost:3000/health
   - API: http://localhost:3000/api

6. **Stop services when done**
   ```powershell
   npm run docker:stop
   ```

## 📊 Monitoring

### View Resource Usage
```powershell
docker stats
```

### View Container Details
```powershell
docker inspect quick-commerce-backend
docker inspect quick-commerce-postgres
docker inspect quick-commerce-redis
```

## 🔐 Security Notes

- Default passwords are for development only
- Change passwords in production
- Don't expose database ports publicly in production
- Use Docker secrets for sensitive data in production

