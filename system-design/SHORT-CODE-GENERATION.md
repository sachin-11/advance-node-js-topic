# Short Code Generation Logic - Complete Explanation

## 🔑 Current Implementation: Database Sequence + Base62 Encoding

### Overview
हम **Counter-based approach** use कर रहे हैं जो:
1. Database का auto-incrementing ID use करता है
2. उस ID को **Base62 encoding** से short code में convert करता है

---

## 📝 Step-by-Step Process

### Step 1: Database में Auto-Increment ID
```sql
-- PostgreSQL में id column SERIAL है
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,  -- Auto-incrementing: 1, 2, 3, 4...
    short_code VARCHAR(255),
    long_url TEXT,
    ...
);
```

### Step 2: ID Generate करना (Atomic Transaction)
```typescript
// 1. Transaction start करें
await client.query('BEGIN');

// 2. Placeholder row insert करें (empty short_code)
// PostgreSQL automatically next ID देगा
INSERT INTO urls (short_code, long_url, expire_at) 
VALUES ('', 'https://example.com', NULL) 
RETURNING id;
// Result: id = 1, 2, 3, 4...

// 3. ID को Base62 में convert करें
shortCode = encodeBase62(id); // 1 -> "1", 2 -> "2", 62 -> "10", etc.

// 4. Actual short_code update करें
UPDATE urls SET short_code = '1' WHERE id = 1;

// 5. Transaction commit करें
await client.query('COMMIT');
```

### Step 3: Base62 Encoding

**Base62 क्या है?**
- 62 characters: `0-9`, `a-z`, `A-Z`
- Total: 10 digits + 26 lowercase + 26 uppercase = 62 characters

**Encoding Examples:**
```
ID 1   → "1"
ID 2   → "2"
ID 10  → "a"
ID 35  → "z"
ID 36  → "A"
ID 61  → "Z"
ID 62  → "10"      (1*62 + 0)
ID 123 → "1Z"      (1*62 + 61)
ID 3844 → "100"    (1*62² + 0*62 + 0)
```

**Code:**
```typescript
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(id: number): string {
  if (id === 0) return '0';
  
  let encoded = '';
  let num = id;
  
  while (num > 0) {
    encoded = BASE62_CHARS[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  
  return encoded;
}
```

---

## 🎯 Complete Flow Diagram

```
Long URL: "https://example.com/very/long/url"
    │
    ▼
1. URL Validation
    │
    ▼
2. Database Transaction Start (BEGIN)
    │
    ▼
3. Insert Row (get auto-increment ID)
   INSERT INTO urls (...) VALUES (...) RETURNING id;
   Result: id = 123
    │
    ▼
4. Base62 Encoding
   encodeBase62(123) → "1Z"
    │
    ▼
5. Update Row with Short Code
   UPDATE urls SET short_code = '1Z' WHERE id = 123;
    │
    ▼
6. Transaction Commit (COMMIT)
    │
    ▼
7. Cache in Redis
   SET url:1Z "https://example.com/very/long/url"
    │
    ▼
8. Return Short URL
   "https://my.tiny/1Z"
```

---

## 🔍 Code Location

### Main Logic: `src/services/urlService.ts`
```typescript
// Line 90-118
else {
  // Generate new short code using database sequence
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Insert to get auto-increment ID
    const insertResult = await client.query(
      'INSERT INTO urls (short_code, long_url, expire_at) VALUES ($1, $2, $3) RETURNING id',
      ['', request.longUrl, request.expireAt || null]
    );
    
    const id = insertResult.rows[0].id;  // Get ID: 1, 2, 3...
    shortCode = encodeBase62(id);        // Convert: 1 -> "1", 62 -> "10"
    
    // Update with actual short code
    await client.query(
      'UPDATE urls SET short_code = $1 WHERE id = $2',
      [shortCode, id]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Base62 Encoding: `src/utils/base62.ts`
```typescript
export function encodeBase62(id: number): string {
  if (id === 0) {
    return BASE62_CHARS[0];
  }

  let encoded = '';
  let num = id;

  while (num > 0) {
    encoded = BASE62_CHARS[num % 62] + encoded;
    num = Math.floor(num / 62);
  }

  return encoded;
}
```

---

## ✅ Advantages of This Approach

1. **Guaranteed Uniqueness**
   - Database auto-increment ensures unique IDs
   - No collisions possible

2. **Sequential & Predictable**
   - IDs are sequential: 1, 2, 3, 4...
   - Short codes: "1", "2", "3", "4"...

3. **Short Codes**
   - Base62 gives shorter codes than decimal
   - ID 1000 → "g8" (2 chars vs 4 digits)

4. **Atomic Operations**
   - Transaction ensures no race conditions
   - Database handles concurrency

5. **No Pre-allocation Needed**
   - IDs generated on-demand
   - No waste of unused codes

---

## 🔄 Alternative Approaches (Not Used)

### 1. Hash-Based (MD5/SHA256)
```typescript
// ❌ Not used - Can have collisions
const hash = crypto.createHash('md5').update(longUrl).digest('hex');
const shortCode = hash.substring(0, 7); // First 7 chars
```
**Problems:**
- Collisions possible
- Same URL = Same code (good?)
- Different URLs might get same code (bad!)

### 2. Random String
```typescript
// ❌ Not used - Collisions possible
const shortCode = Math.random().toString(36).substring(2, 9);
```
**Problems:**
- Collisions possible
- Need to check uniqueness each time
- Slower

### 3. Distributed Counter
```typescript
// ✅ Better for large scale
// Uses Zookeeper/etcd for distributed counter
// Each server gets a range: 1000-1999, 2000-2999, etc.
```
**Advantages:**
- Works across multiple servers
- No database bottleneck
- Better for high scale

---

## 📊 Comparison Table

| Approach | Uniqueness | Collisions | Performance | Scale |
|----------|-----------|------------|-------------|-------|
| **Counter + Base62** ✅ | Guaranteed | None | Fast | Good (single DB) |
| Hash-based | Possible | Yes | Fast | Good |
| Random | Possible | Yes | Medium | Good |
| Distributed Counter | Guaranteed | None | Very Fast | Excellent |

---

## 🧪 Testing the Logic

### Test Base62 Encoding
```typescript
encodeBase62(1)    // "1"
encodeBase62(62)   // "10"
encodeBase62(123)  // "1Z"
encodeBase62(3844) // "100"
```

### Test Full Flow
```bash
# 1. Create short URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com"}'

# Response: {"shortUrl": "https://my.tiny/1"}

# 2. Check database
psql -U postgres -d tinyurl -c "SELECT id, short_code FROM urls;"
# Result: id=1, short_code="1"

# 3. Create another
curl -X POST ... -d '{"longUrl": "https://google.com"}'
# Response: {"shortUrl": "https://my.tiny/2"}

# 4. Check again
# Result: id=2, short_code="2"
```

---

## 🚀 Real Example

```typescript
// Request 1
POST /api/shorten
{ "longUrl": "https://example.com" }
→ Database ID: 1
→ Base62: encodeBase62(1) = "1"
→ Short URL: "https://my.tiny/1"

// Request 2
POST /api/shorten
{ "longUrl": "https://google.com" }
→ Database ID: 2
→ Base62: encodeBase62(2) = "2"
→ Short URL: "https://my.tiny/2"

// Request 3
POST /api/shorten
{ "longUrl": "https://github.com" }
→ Database ID: 62
→ Base62: encodeBase62(62) = "10"
→ Short URL: "https://my.tiny/10"

// Request 4
POST /api/shorten
{ "longUrl": "https://stackoverflow.com" }
→ Database ID: 123
→ Base62: encodeBase62(123) = "1Z"
→ Short URL: "https://my.tiny/1Z"
```

---

## 💡 Key Points

1. **Database ID** → **Base62 Encoding** → **Short Code**
2. **Auto-increment ID** ensures uniqueness
3. **Base62** makes codes shorter (62 chars vs 10 digits)
4. **Transaction** ensures atomicity (no race conditions)
5. **Simple & Reliable** approach

---

## 📝 Summary

**Current Logic:**
```
Long URL 
  → Database INSERT (get auto-increment ID: 123)
  → Base62 encode (123 → "1Z")
  → Update row with short_code
  → Cache in Redis
  → Return short URL
```

**Why This Approach?**
- ✅ Simple to implement
- ✅ Guaranteed unique codes
- ✅ No collisions
- ✅ Short codes (Base62)
- ✅ Atomic operations (transactions)
- ✅ Good performance

**For Production Scale:**
- Current: Single database (works for millions)
- Large scale: Distributed counter (billions)

---

*This is the standard approach used by most URL shortening services!*

