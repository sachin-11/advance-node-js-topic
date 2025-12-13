#!/bin/bash

# Redis Cache Check Script
# Usage: ./check-redis.sh [code]

CODE=${1:-"abc"}

echo "🔍 Checking Redis Cache for code: $CODE"
echo ""

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running!"
    echo "💡 Start Redis: brew services start redis"
    exit 1
fi

echo "✅ Redis is running"
echo ""

# Check cache key
CACHE_KEY="url:$CODE"
CACHED_VALUE=$(redis-cli GET "$CACHE_KEY" 2>/dev/null)

if [ -z "$CACHED_VALUE" ]; then
    echo "❌ Cache MISS: Code '$CODE' not found in Redis"
    echo "   This means data will be fetched from PostgreSQL"
else
    echo "✅ Cache HIT: Code '$CODE' found in Redis"
    echo "   Value: $CACHED_VALUE"
    echo ""
    
    # Check TTL
    TTL=$(redis-cli TTL "$CACHE_KEY" 2>/dev/null)
    if [ "$TTL" -eq -1 ]; then
        echo "   TTL: No expiration"
    elif [ "$TTL" -eq -2 ]; then
        echo "   TTL: Key expired"
    else
        echo "   TTL: $TTL seconds remaining"
    fi
fi

echo ""
echo "📊 All cached URLs:"
redis-cli KEYS "url:*" 2>/dev/null | head -10

echo ""
echo "📊 Click counters:"
redis-cli KEYS "clicks:*" 2>/dev/null | head -10

