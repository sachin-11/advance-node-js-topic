/**
 * TinyURL - Complete Implementation Example
 * Production-ready code with all features
 */

const express = require('express');
const redis = require('redis');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const app = express();
app.use(express.json());

// ============================================================================
// Configuration
// ============================================================================
const config = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/',
        dbName: 'tinyurl'
    },
    cache: {
        ttl: 86400 // 1 day in seconds
    }
};

// ============================================================================
// Database Connections
// ============================================================================
const redisClient = redis.createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

let mongoClient;
let db;
let urlsCollection;
let countersCollection;

(async () => {
    try {
        mongoClient = new MongoClient(config.mongodb.uri);
        await mongoClient.connect();
        db = mongoClient.db(config.mongodb.dbName);
        urlsCollection = db.collection('urls');
        countersCollection = db.collection('counters');
        
        // Create indexes
        await urlsCollection.createIndex({ short_code: 1 }, { unique: true });
        await urlsCollection.createIndex({ expires_at: 1 });
        await urlsCollection.createIndex({ created_at: -1 });
        
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
})();

// ============================================================================
// Base62 Encoding/Decoding
// ============================================================================
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encode number to Base62 string
 */
function encodeBase62(num) {
    if (num === 0) return BASE62[0];
    
    let result = '';
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    
    // Pad to 7 characters for consistency
    return result.padStart(7, '0');
}

/**
 * Decode Base62 string to number
 */
function decodeBase62(shortCode) {
    let num = 0;
    for (let i = 0; i < shortCode.length; i++) {
        const char = shortCode[i];
        const index = BASE62.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid character in short code: ${char}`);
        }
        num = num * 62 + index;
    }
    return num;
}

// ============================================================================
// Short Code Generation
// ============================================================================

/**
 * Generate unique short code using distributed counter
 * In production, use Zookeeper, etcd, or database with proper locking
 */
async function generateShortCode() {
    try {
        // Use findOneAndUpdate for atomic operation
        const result = await countersCollection.findOneAndUpdate(
            { _id: 'url_counter' },
            { 
                $inc: { seq: 1 },
                $setOnInsert: { seq: 0 }
            },
            { 
                upsert: true, 
                returnDocument: 'after' 
            }
        );
        
        return encodeBase62(result.seq);
    } catch (error) {
        console.error('Error generating short code:', error);
        throw new Error('Failed to generate short code');
    }
}

/**
 * Alternative: Hash-based short code generation
 */
function generateHashBasedCode(longUrl, length = 7) {
    const hash = crypto.createHash('sha256').update(longUrl).digest('hex');
    let shortCode = '';
    
    // Convert hex to base62
    let num = parseInt(hash.substring(0, 8), 16);
    while (num > 0 && shortCode.length < length) {
        shortCode = BASE62[num % 62] + shortCode;
        num = Math.floor(num / 62);
    }
    
    return shortCode.padStart(length, '0');
}

// ============================================================================
// URL Validation
// ============================================================================
function isValidUrl(url) {
    try {
        // Use validator library for better validation
        return validator.isURL(url, {
            protocols: ['http', 'https'],
            require_protocol: true
        });
    } catch (error) {
        return false;
    }
}

function isMaliciousUrl(url) {
    // Simple check - in production, use security services
    const maliciousPatterns = [
        /phishing/i,
        /malware/i,
        /spam/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(url));
}

// ============================================================================
// Rate Limiting
// ============================================================================
const shortenLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour per IP
    message: {
        error: 'Too many requests. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * POST /api/shorten
 * Create a short URL from a long URL
 */
app.post('/api/shorten', shortenLimiter, async (req, res) => {
    try {
        const { longUrl, customCode, expiresIn } = req.body;
        
        // Validate input
        if (!longUrl) {
            return res.status(400).json({ 
                error: 'longUrl is required' 
            });
        }
        
        // Validate URL format
        if (!isValidUrl(longUrl)) {
            return res.status(400).json({ 
                error: 'Invalid URL format. Must start with http:// or https://' 
            });
        }
        
        // Check for malicious URLs
        if (isMaliciousUrl(longUrl)) {
            return res.status(403).json({ 
                error: 'URL is not allowed' 
            });
        }
        
        // Check if URL already exists (optional optimization)
        const existingUrl = await urlsCollection.findOne({ 
            original_url: longUrl 
        });
        
        if (existingUrl && !existingUrl.expires_at) {
            // Return existing short URL
            const shortUrl = `${config.baseUrl}/${existingUrl.short_code}`;
            return res.json({
                shortUrl,
                shortCode: existingUrl.short_code,
                longUrl: existingUrl.original_url,
                createdAt: existingUrl.created_at,
                expiresAt: existingUrl.expires_at
            });
        }
        
        // Generate or validate custom code
        let shortCode = customCode;
        
        if (customCode) {
            // Validate custom code format
            if (!/^[a-zA-Z0-9]{1,10}$/.test(customCode)) {
                return res.status(400).json({ 
                    error: 'Custom code must be alphanumeric and 1-10 characters' 
                });
            }
            
            // Check if custom code already exists
            const existing = await urlsCollection.findOne({ 
                short_code: customCode 
            });
            
            if (existing) {
                return res.status(409).json({ 
                    error: 'Custom code already exists' 
                });
            }
            
            shortCode = customCode;
        } else {
            // Generate unique short code
            shortCode = await generateShortCode();
        }
        
        // Calculate expiration
        const expiresAt = expiresIn 
            ? new Date(Date.now() + expiresIn * 1000)
            : null;
        
        // Create URL document
        const urlDoc = {
            short_code: shortCode,
            original_url: longUrl,
            created_at: new Date(),
            expires_at: expiresAt,
            click_count: 0,
            user_id: req.user?.id || null // If authentication is added
        };
        
        // Store in database
        await urlsCollection.insertOne(urlDoc);
        
        // Store in cache
        const cacheValue = JSON.stringify({
            originalUrl: longUrl,
            expiresAt: expiresAt?.toISOString()
        });
        
        await redisClient.setEx(
            `url:${shortCode}`,
            config.cache.ttl,
            cacheValue
        );
        
        const shortUrl = `${config.baseUrl}/${shortCode}`;
        
        res.status(201).json({
            shortUrl,
            shortCode,
            longUrl,
            createdAt: urlDoc.created_at,
            expiresAt: expiresAt
        });
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

/**
 * GET /:shortCode
 * Redirect to original URL
 */
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        // Validate short code format
        if (!/^[a-zA-Z0-9]{1,10}$/.test(shortCode)) {
            return res.status(400).json({ 
                error: 'Invalid short code format' 
            });
        }
        
        // Check cache first
        const cachedData = await redisClient.get(`url:${shortCode}`);
        
        if (cachedData) {
            const { originalUrl, expiresAt } = JSON.parse(cachedData);
            
            // Check expiration
            if (expiresAt && new Date() > new Date(expiresAt)) {
                // Remove from cache
                await redisClient.del(`url:${shortCode}`);
                return res.status(410).json({ 
                    error: 'URL has expired' 
                });
            }
            
            // Update click count asynchronously (fire and forget)
            updateClickCount(shortCode).catch(console.error);
            
            // Track analytics asynchronously
            trackAnalytics(shortCode, req).catch(console.error);
            
            return res.redirect(301, originalUrl);
        }
        
        // Check database
        const urlDoc = await urlsCollection.findOne({ 
            short_code: shortCode 
        });
        
        if (!urlDoc) {
            return res.status(404).json({ 
                error: 'URL not found' 
            });
        }
        
        // Check expiration
        if (urlDoc.expires_at && new Date() > urlDoc.expires_at) {
            // Delete expired URL
            await urlsCollection.deleteOne({ short_code: shortCode });
            return res.status(410).json({ 
                error: 'URL has expired' 
            });
        }
        
        // Store in cache
        const cacheValue = JSON.stringify({
            originalUrl: urlDoc.original_url,
            expiresAt: urlDoc.expires_at?.toISOString()
        });
        
        await redisClient.setEx(
            `url:${shortCode}`,
            config.cache.ttl,
            cacheValue
        );
        
        // Update click count
        await updateClickCount(shortCode);
        
        // Track analytics
        await trackAnalytics(shortCode, req);
        
        // Redirect
        res.redirect(301, urlDoc.original_url);
        
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * GET /api/stats/:shortCode
 * Get statistics for a short URL
 */
app.get('/api/stats/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        const urlDoc = await urlsCollection.findOne(
            { short_code: shortCode },
            { 
                projection: { 
                    original_url: 0 // Don't return original URL for privacy
                } 
            }
        );
        
        if (!urlDoc) {
            return res.status(404).json({ 
                error: 'URL not found' 
            });
        }
        
        res.json({
            shortCode: urlDoc.short_code,
            clickCount: urlDoc.click_count,
            createdAt: urlDoc.created_at,
            expiresAt: urlDoc.expires_at,
            isExpired: urlDoc.expires_at ? new Date() > urlDoc.expires_at : false
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * DELETE /api/url/:shortCode
 * Delete a short URL
 */
app.delete('/api/url/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        const result = await urlsCollection.deleteOne({ 
            short_code: shortCode 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                error: 'URL not found' 
            });
        }
        
        // Remove from cache
        await redisClient.del(`url:${shortCode}`);
        
        res.json({ 
            message: 'URL deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting URL:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update click count for a URL
 */
async function updateClickCount(shortCode) {
    try {
        await urlsCollection.updateOne(
            { short_code: shortCode },
            { $inc: { click_count: 1 } }
        );
    } catch (error) {
        console.error('Error updating click count:', error);
    }
}

/**
 * Track analytics for a URL click
 */
async function trackAnalytics(shortCode, req) {
    try {
        const analyticsDoc = {
            short_code: shortCode,
            clicked_at: new Date(),
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            referrer: req.get('referer'),
            country: req.headers['cf-ipcountry'] || null // Cloudflare header
        };
        
        // Store in analytics collection (async, don't block)
        db.collection('analytics').insertOne(analyticsDoc).catch(console.error);
    } catch (error) {
        console.error('Error tracking analytics:', error);
    }
}

// ============================================================================
// Background Jobs
// ============================================================================

/**
 * Cleanup expired URLs (run periodically via cron)
 */
async function cleanupExpiredUrls() {
    try {
        const result = await urlsCollection.deleteMany({
            expires_at: { $lt: new Date() }
        });
        
        console.log(`Cleaned up ${result.deletedCount} expired URLs`);
    } catch (error) {
        console.error('Error cleaning up expired URLs:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredUrls, 60 * 60 * 1000);

// ============================================================================
// Health Check
// ============================================================================
app.get('/health', async (req, res) => {
    try {
        // Check Redis connection
        await redisClient.ping();
        
        // Check MongoDB connection
        await db.admin().ping();
        
        res.json({ 
            status: 'healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy',
            error: error.message 
        });
    }
});

// ============================================================================
// Error Handling Middleware
// ============================================================================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});

// ============================================================================
// Start Server
// ============================================================================
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 TinyURL server running on port ${PORT}`);
    console.log(`📍 Base URL: ${config.baseUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await redisClient.quit();
    await mongoClient.close();
    process.exit(0);
});

// ============================================================================
// Example Usage
// ============================================================================

/*
// Create short URL
POST http://localhost:3000/api/shorten
Content-Type: application/json

{
  "longUrl": "https://www.example.com/very/long/path/to/resource",
  "expiresIn": 86400
}

Response:
{
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123",
  "longUrl": "https://www.example.com/very/long/path/to/resource",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}

// Redirect
GET http://localhost:3000/abc123
→ Redirects to original URL

// Get stats
GET http://localhost:3000/api/stats/abc123

Response:
{
  "shortCode": "abc123",
  "clickCount": 42,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z",
  "isExpired": false
}
*/

