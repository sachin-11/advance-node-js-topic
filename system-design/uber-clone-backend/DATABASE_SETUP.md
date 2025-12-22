# 🗄️ PostgreSQL Database Setup Guide

Complete guide to set up PostgreSQL database for Uber Clone Backend.

## Prerequisites

1. **PostgreSQL installed** (version 12 or higher)
   - Download: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres-uber -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Node.js dependencies installed**
   ```bash
   npm install
   ```

---

## Quick Setup

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name postgres-uber \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=uber_clone \
  -p 5432:5432 \
  -d postgres

# Wait a few seconds for PostgreSQL to start
sleep 5

# Initialize database
npm run db:init
```

### Option 2: Local PostgreSQL

1. **Create database:**
   ```sql
   CREATE DATABASE uber_clone;
   ```

2. **Configure .env file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uber_clone
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSL=false
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   ```

---

## Configuration

### Environment Variables

Edit `.env` file:

```env
# Database Configuration
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_NAME=uber_clone        # Database name
DB_USER=postgres          # Database user
DB_PASSWORD=postgres      # Database password
DB_SSL=false              # Use SSL (true/false)
```

**Note:** If `DB_HOST` is not set, the application will use in-memory storage.

---

## Database Schema

The database includes the following tables:

### 1. `drivers`
Stores driver information and location
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR)
- `location_lat`, `location_lng` (DECIMAL)
- `is_available` (BOOLEAN)
- `vehicle_type`, `zone`, `rating`
- Timestamps: `created_at`, `updated_at`

### 2. `rides`
Stores ride information
- `id` (VARCHAR) - Primary key
- `rider_id`, `driver_id` (VARCHAR)
- `status` (VARCHAR) - PENDING, MATCHED, ACCEPTED, etc.
- `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng` (DECIMAL)
- `distance`, `estimated_fare`, `final_fare` (DECIMAL)
- Timestamps: `created_at`, `updated_at`, `started_at`, `completed_at`

### 3. `ride_status_history`
Tracks ride status changes
- `id` (SERIAL) - Primary key
- `ride_id` (VARCHAR) - Foreign key to rides
- `status` (VARCHAR)
- `metadata` (JSONB)
- `timestamp` (TIMESTAMP)

### 4. `driver_location_history`
Tracks driver location updates
- `id` (SERIAL) - Primary key
- `driver_id` (VARCHAR) - Foreign key to drivers
- `location_lat`, `location_lng` (DECIMAL)
- `timestamp` (TIMESTAMP)

---

## Commands

### Initialize Database
```bash
npm run db:init
```
Creates all tables and indexes.

### Run Migrations
```bash
npm run db:migrate
```
Runs database migrations (future use).

---

## Verification

### Check Database Connection

Start the server:
```bash
npm start
```

You should see:
```
✅ PostgreSQL connection pool created
✅ Database connected: 2024-12-21T14:30:00.000Z
💾 Storage: PostgreSQL
```

### Test with API

```bash
# Health check
curl http://localhost:3000/api/health

# Get stats
curl http://localhost:3000/api/stats
```

---

## Switching Between Storage Modes

### Use PostgreSQL
Set `DB_HOST` in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uber_clone
DB_USER=postgres
DB_PASSWORD=postgres
```

### Use In-Memory Storage
Remove or comment out `DB_HOST`:
```env
# DB_HOST=localhost
```

The application will automatically detect and use in-memory storage.

---

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list                # macOS
```

### Authentication Failed
```
Error: password authentication failed
```
**Solution:** Check username and password in `.env` file.

### Database Does Not Exist
```
Error: database "uber_clone" does not exist
```
**Solution:** Create the database:
```sql
CREATE DATABASE uber_clone;
```

### Permission Denied
```
Error: permission denied for table
```
**Solution:** Grant proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE uber_clone TO postgres;
```

---

## Production Setup

For production, consider:

1. **Connection Pooling:** Already configured (max 20 connections)
2. **SSL:** Enable `DB_SSL=true` for secure connections
3. **Backup:** Set up regular PostgreSQL backups
4. **Monitoring:** Use PostgreSQL monitoring tools
5. **Read Replicas:** For high availability

---

## Data Persistence

With PostgreSQL:
- ✅ Data persists across server restarts
- ✅ Can query historical data
- ✅ Supports complex queries
- ✅ ACID transactions
- ✅ Backup and recovery

With In-Memory:
- ❌ Data lost on server restart
- ❌ No historical queries
- ✅ Faster for development/testing

---

**Happy Coding! 🚕**
