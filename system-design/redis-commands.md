# Redis Commands for Debugging

## Basic Redis Commands

### 1. Check if Redis is running
```bash
redis-cli ping
# Should return: PONG
```

### 2. Check all cached URLs
```bash
redis-cli KEYS "url:*"
```

### 3. Get specific cached URL
```bash
redis-cli GET "url:abc"
# Returns: https://google.com
```

### 4. Check all click counters
```bash
redis-cli KEYS "clicks:*"
```

### 5. Get click count for specific code
```bash
redis-cli GET "clicks:abc"
```

### 6. Check TTL (Time To Live) of a key
```bash
redis-cli TTL "url:abc"
# Returns: -1 (no expiration) or seconds remaining
```

### 7. See all keys with values
```bash
redis-cli KEYS "*"
```

### 8. Monitor Redis commands in real-time
```bash
redis-cli MONITOR
# Shows all Redis commands as they happen
```

### 9. Get Redis info
```bash
redis-cli INFO
# Shows detailed Redis server information
```

### 10. Clear all cache (careful!)
```bash
redis-cli FLUSHALL
# Deletes all keys from Redis
```

### 11. Delete specific key
```bash
redis-cli DEL "url:abc"
```

### 12. Check if key exists
```bash
redis-cli EXISTS "url:abc"
# Returns: 1 (exists) or 0 (doesn't exist)
```

## Useful One-liners

### Check cache for code "abc"
```bash
redis-cli GET "url:abc" && echo "✅ Found in Redis" || echo "❌ Not in Redis"
```

### Count all cached URLs
```bash
redis-cli KEYS "url:*" | wc -l
```

### See all cached URLs with their values
```bash
redis-cli KEYS "url:*" | xargs -I {} redis-cli GET {}
```

### Check click counts
```bash
redis-cli KEYS "clicks:*" | xargs -I {} sh -c 'echo "{}: $(redis-cli GET {})"'
```

