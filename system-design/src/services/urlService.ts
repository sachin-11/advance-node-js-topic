import { query, getClient } from '../db/pg';
import { get, set, incr, keys, del, getRedisStatus } from '../cache/redis';
import { encodeBase62 } from '../utils/base62';
import validator from 'validator';

export interface UrlRecord {
  id: number;
  short_code: string;
  long_url: string;
  created_at: Date;
  expire_at: Date | null;
  click_count: number;
}

export interface ShortenRequest {
  longUrl: string;
  customAlias?: string;
  expireAt?: string;
}

export interface ShortenResponse {
  shortUrl: string;
}

export interface StatsResponse {
  longUrl: string;
  createdAt: string;
  clickCount: number;
  expireAt: string | null;
}

/**
 * URL Service - Business logic for URL shortening
 */
export class UrlService {
  private readonly CACHE_TTL = 3600; // 1 hour cache TTL
  private readonly BASE_URL = process.env.BASE_URL || 'https://my.tiny';

  /**
   * Validate and normalize a URL
   */
  private validateUrl(url: string): boolean {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
    });
  }

  /**
   * Validate custom alias format (alphanumeric + -/_)
   */
  private validateCustomAlias(alias: string): boolean {
    return /^[a-zA-Z0-9\-_]+$/.test(alias) && alias.length >= 3 && alias.length <= 20;
  }

  /**
   * Check if a short code already exists
   */
  private async codeExists(shortCode: string): Promise<boolean> {
    const result = await query<UrlRecord>(
      'SELECT id FROM urls WHERE short_code = $1',
      [shortCode]
    );
    return result.length > 0;
  }

  /**
   * Create a new short URL
   */
  async shortenUrl(request: ShortenRequest): Promise<ShortenResponse> {
    // Validate long URL
    if (!this.validateUrl(request.longUrl)) {
      throw new Error('Invalid URL format. Must include http:// or https://');
    }

    let shortCode: string;

    // Handle custom alias
    if (request.customAlias) {
      if (!this.validateCustomAlias(request.customAlias)) {
        throw new Error('Custom alias must be 3-20 characters, alphanumeric with -/_ only');
      }

      // Check if custom alias already exists
      if (await this.codeExists(request.customAlias)) {
        throw new Error('Custom alias already exists');
      }

      shortCode = request.customAlias;
    } else {
      // Generate new short code using database sequence
      const client = await getClient();
      try {
        await client.query('BEGIN');
        
        // Insert a placeholder row to get the next ID
        const insertResult = await client.query(
          'INSERT INTO urls (short_code, long_url, expire_at) VALUES ($1, $2, $3) RETURNING id',
          ['', request.longUrl, request.expireAt || null]
        );
        
        const id = insertResult.rows[0].id;
        shortCode = encodeBase62(id);
        
        // Update with the actual short code
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

    // Parse expiration date if provided
    let expireAt: Date | null = null;
    if (request.expireAt) {
      expireAt = new Date(request.expireAt);
      if (isNaN(expireAt.getTime())) {
        throw new Error('Invalid expiration date format');
      }
    }

    // Insert or update the URL record
    if (request.customAlias) {
      await query(
        'INSERT INTO urls (short_code, long_url, expire_at) VALUES ($1, $2, $3)',
        [shortCode, request.longUrl, expireAt]
      );
    }

    // Cache the mapping
    const cacheKey = `url:${shortCode}`;
    await set(cacheKey, request.longUrl, this.CACHE_TTL);

    return {
      shortUrl: `${this.BASE_URL}/${shortCode}`,
    };
  }

  /**
   * Get long URL by short code (with caching)
   */
  async getLongUrl(shortCode: string): Promise<string | null> {
    // Check Redis cache first
    const cacheKey = `url:${shortCode}`;
    const cachedUrl = await get(cacheKey);
    
    if (cachedUrl) {
      console.log(`✅ Cache HIT: ${shortCode} -> ${cachedUrl.substring(0, 50)}...`);
      return cachedUrl;
    }

    console.log(`❌ Cache MISS: ${shortCode} - fetching from PostgreSQL`);

    // Fall back to PostgreSQL
    const result = await query<UrlRecord>(
      'SELECT long_url, expire_at FROM urls WHERE short_code = $1',
      [shortCode]
    );

    if (result.length === 0) {
      return null;
    }

    const urlRecord = result[0];

    // Check if URL has expired
    if (urlRecord.expire_at && new Date(urlRecord.expire_at) < new Date()) {
      return null;
    }

    // Cache the result
    await set(cacheKey, urlRecord.long_url, this.CACHE_TTL);
    console.log(`💾 Cached: ${shortCode} -> ${urlRecord.long_url.substring(0, 50)}...`);

    return urlRecord.long_url;
  }

  /**
   * Increment click count asynchronously using Redis
   */
  async incrementClickCount(shortCode: string): Promise<void> {
    const clickKey = `clicks:${shortCode}`;
    await incr(clickKey);
  }

  /**
   * Get URL statistics
   */
  async getStats(shortCode: string): Promise<StatsResponse | null> {
    const result = await query<UrlRecord>(
      'SELECT long_url, created_at, click_count, expire_at FROM urls WHERE short_code = $1',
      [shortCode]
    );

    if (result.length === 0) {
      return null;
    }

    const urlRecord = result[0];

    // Get current click count from Redis (may be higher than DB)
    const clickKey = `clicks:${shortCode}`;
    const redisClicks = await get(clickKey);
    const totalClicks = redisClicks 
      ? parseInt(redisClicks, 10) + urlRecord.click_count 
      : urlRecord.click_count;

    return {
      longUrl: urlRecord.long_url,
      createdAt: urlRecord.created_at.toISOString(),
      clickCount: totalClicks,
      expireAt: urlRecord.expire_at ? urlRecord.expire_at.toISOString() : null,
    };
  }

  /**
   * Flush click counts from Redis to PostgreSQL
   * Called by background worker
   */
  async flushClickCounts(): Promise<void> {
    // Check if Redis is available before flushing
    const redisStatus = getRedisStatus();
    if (!redisStatus.connected) {
      return; // Skip if Redis is not available
    }

    try {
      const clickKeys = await keys('clicks:*');
      
      if (clickKeys.length === 0) {
        return; // No click counts to flush
      }
      
      for (const key of clickKeys) {
        const shortCode = key.replace('clicks:', '');
        const clickCountStr = await get(key);
        
        if (clickCountStr) {
          const clickCount = parseInt(clickCountStr, 10);
          
          if (clickCount > 0) {
            // Update PostgreSQL
            await query(
              'UPDATE urls SET click_count = click_count + $1 WHERE short_code = $2',
              [clickCount, shortCode]
            );
            
            // Delete from Redis after flushing
            await del(key);
          }
        }
      }
    } catch (error: any) {
      // Don't throw - worker will retry on next interval
      if (error?.message?.includes('closed') || error?.message?.includes('ClientClosed')) {
        return; // Redis is closed, skip this flush
      }
      throw error; // Re-throw other errors
    }
  }
}

