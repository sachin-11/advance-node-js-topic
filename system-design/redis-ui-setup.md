# Redis UI Tools for Mac

## ✅ Option 1: RedisInsight (Installed - Recommended)

**Official Redis GUI tool by Redis Labs**

### Installation:
```bash
brew install --cask redis-insight
```

### How to Use:
1. Open "Redis Insight" from Applications
2. Click "Add Redis Database"
3. Enter connection details:
   - **Host:** `localhost`
   - **Port:** `6379`
   - **Database Alias:** `Local Redis` (or any name)
4. Click "Add Redis Database"

### Features:
- ✅ Free and official
- ✅ Visual key browser
- ✅ Query editor
- ✅ Real-time monitoring
- ✅ Memory analysis
- ✅ Slow log viewer
- ✅ Multiple database support

---

## Option 2: Another Redis Desktop Manager

### Installation:
```bash
brew install --cask another-redis-desktop-manager
```

### Features:
- ✅ Free and open source
- ✅ Modern UI
- ✅ Key management
- ✅ Value editor
- ✅ Command line interface

---

## Option 3: Medis

### Installation:
```bash
brew install --cask medis
```

### Features:
- ✅ Free
- ✅ Clean interface
- ✅ Key browsing
- ✅ Value editing
- ✅ Connection management

---

## Option 4: Redis Commander (Web-based)

### Installation:
```bash
npm install -g redis-commander
```

### Usage:
```bash
redis-commander
# Opens at http://localhost:8081
```

### Features:
- ✅ Web-based (no app install)
- ✅ Access from browser
- ✅ Cross-platform

---

## Quick Setup Guide for RedisInsight

### Step 1: Open RedisInsight
```bash
open -a "Redis Insight"
```

### Step 2: Add Connection
- Click "Add Redis Database"
- Or use "Add Database Manually"

### Step 3: Connection Settings
```
Host: localhost
Port: 6379
Database Alias: Local Redis
Username: (leave empty)
Password: (leave empty if no password)
```

### Step 4: Connect
- Click "Add Redis Database"
- You'll see your Redis instance

### Step 5: Browse Keys
- Click on your database
- Go to "Browser" tab
- You'll see all keys:
  - `url:abc`
  - `url:1`
  - `clicks:abc`
  - etc.

### Step 6: View Values
- Click on any key to see its value
- Edit values if needed
- Delete keys
- Set TTL (expiration)

---

## What You Can Do in RedisInsight

### 1. Browse All Keys
- See all cached URLs: `url:*`
- See click counters: `clicks:*`
- See rate limits: `rate_limit:*`

### 2. View Key Values
- Click on `url:abc` to see: `https://google.com`
- Click on `clicks:abc` to see click count

### 3. Edit Values
- Double-click to edit
- Change values directly
- Set expiration (TTL)

### 4. Run Commands
- Use "CLI" tab
- Run Redis commands:
  ```
  GET url:abc
  KEYS url:*
  TTL url:abc
  ```

### 5. Monitor Performance
- See memory usage
- Monitor commands per second
- View slow queries

### 6. Analyze Data
- See key distribution
- Memory analysis
- Pattern matching

---

## Troubleshooting

### Redis not connecting?
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
brew services start redis
```

### Can't see keys?
- Make sure Redis is running
- Check connection settings (localhost:6379)
- Try refreshing the connection

### Connection refused?
```bash
# Check Redis port
lsof -i :6379

# Restart Redis
brew services restart redis
```

---

## Recommended: RedisInsight

**Why RedisInsight?**
- ✅ Official tool by Redis
- ✅ Most features
- ✅ Best documentation
- ✅ Regular updates
- ✅ Free

**Already Installed!** 🎉

Just open it from Applications and connect to `localhost:6379`

