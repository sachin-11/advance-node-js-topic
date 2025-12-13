import pool from '../config/database';
import { get, set, del, keys } from '../config/redis';
import { encodeBase62 } from '../utils/base62';
import { Paste } from '../models/types';
import { SecurityService } from './securityService';
import * as hljs from 'highlight.js';

const securityService = new SecurityService();

export interface PasteCreateRequest {
  content: string;
  title?: string;
  language?: string;
  privacy?: 'public' | 'private' | 'unlisted';
  password?: string;
  expires_in?: number; // seconds
  max_views?: number;
  burn_after_reading?: boolean;
  user_id?: number;
}

export interface PasteResponse {
  paste_id: string;
  url: string;
  expires_at?: Date;
  created_at: Date;
}

/**
 * Paste Service - Business logic for paste operations
 */
export class PasteService {
  private readonly CACHE_TTL = 3600; // 1 hour cache TTL
  private readonly BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  private readonly MAX_CONTENT_SIZE = 10485760; // 10MB

  /**
   * Create a new paste
   */
  async createPaste(request: PasteCreateRequest): Promise<PasteResponse> {
    // Validate content
    const validation = securityService.validateContent(request.content, this.MAX_CONTENT_SIZE);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check for malicious content
    if (await securityService.checkMaliciousContent(request.content)) {
      throw new Error('Content contains potentially malicious patterns');
    }

    // Generate paste ID
    const pasteId = await this.generatePasteId();

    // Hash password if provided
    let passwordHash: string | undefined;
    if (request.password) {
      passwordHash = await securityService.hashPassword(request.password);
    }

    // Calculate expiration
    let expiresAt: Date | null = null;
    if (request.expires_in) {
      expiresAt = new Date(Date.now() + request.expires_in * 1000);
    }

    // Determine content storage location
    const contentSize = Buffer.byteLength(request.content, 'utf8');
    const contentLocation = contentSize > 65536 ? 's3' : 'db'; // 64KB threshold

    // Create paste record
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO pastes (
          paste_id, title, content, content_location, content_url,
          language, user_id, privacy, password_hash,
          expires_at, max_views, burn_after_reading, content_size
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        pasteId,
        request.title || null,
        contentLocation === 'db' ? request.content : null,
        contentLocation,
        contentLocation === 's3' ? `s3://pastebin-storage/pastes/${pasteId}` : null,
        request.language || 'text',
        request.user_id || null,
        request.privacy || 'public',
        passwordHash || null,
        expiresAt,
        request.max_views || null,
        request.burn_after_reading || false,
        contentSize,
      ];

      const result = await client.query(insertQuery, values);
      const paste = result.rows[0];

      await client.query('COMMIT');

      // Cache the paste
      await set(`paste:${pasteId}`, JSON.stringify(paste), this.CACHE_TTL);

      return {
        paste_id: paste.paste_id,
        url: `${this.BASE_URL}/paste/${paste.paste_id}`,
        expires_at: paste.expires_at,
        created_at: paste.created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get paste by ID
   */
  async getPaste(pasteId: string, password?: string): Promise<Paste | null> {
    // Check Redis cache first
    const cacheKey = `paste:${pasteId}`;
    const cachedPaste = await get(cacheKey);

    let paste: Paste | null = null;

    if (cachedPaste) {
      console.log(`✅ Cache HIT: ${pasteId}`);
      paste = JSON.parse(cachedPaste);
    } else {
      console.log(`❌ Cache MISS: ${pasteId} - fetching from PostgreSQL`);

      // Fall back to PostgreSQL
      const result = await pool.query(
        'SELECT * FROM pastes WHERE paste_id = $1 AND deleted_at IS NULL',
        [pasteId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      paste = result.rows[0];

      // Cache the result
      await set(cacheKey, JSON.stringify(paste), this.CACHE_TTL);
    }

    // Check if expired
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      return null;
    }

    // Check view-based expiration
    if (paste.max_views && paste.view_count >= paste.max_views) {
      return null;
    }

    // Check password protection
    if (paste.password_hash) {
      if (!password) {
        throw new Error('Password required');
      }
      const isValid = await securityService.verifyPassword(password, paste.password_hash);
      if (!isValid) {
        throw new Error('Invalid password');
      }
    }

    // Check burn after reading
    if (paste.burn_after_reading && paste.viewed_once) {
      return null; // Already viewed
    }

    // Mark as viewed if burn after reading
    if (paste.burn_after_reading && !paste.viewed_once) {
      await pool.query(
        'UPDATE pastes SET viewed_once = TRUE WHERE paste_id = $1',
        [pasteId]
      );
      // Delete from cache
      await del(cacheKey);
    }

    return paste;
  }

  /**
   * Increment view count asynchronously
   */
  async incrementViewCount(pasteId: string): Promise<void> {
    const viewKey = `views:${pasteId}`;
    await require('../config/redis').incr(viewKey);
  }

  /**
   * Get paste statistics
   */
  async getStats(pasteId: string): Promise<any> {
    const result = await pool.query(
      'SELECT view_count, created_at, expires_at FROM pastes WHERE paste_id = $1',
      [pasteId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const paste = result.rows[0];

    // Get view count from Redis (may be higher than DB)
    const viewKey = `views:${pasteId}`;
    const redisViews = await get(viewKey);
    const totalViews = redisViews
      ? parseInt(redisViews, 10) + paste.view_count
      : paste.view_count;

    return {
      paste_id: pasteId,
      view_count: totalViews,
      created_at: paste.created_at,
      expires_at: paste.expires_at,
    };
  }

  /**
   * Generate paste ID using Base62 encoding
   */
  private async generatePasteId(): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert placeholder to get auto-increment ID
      const insertResult = await client.query(
        'INSERT INTO pastes (paste_id, content) VALUES ($1, $2) RETURNING id',
        ['', '']
      );

      const id = insertResult.rows[0].id;
      const pasteId = encodeBase62(id);

      // Delete placeholder
      await client.query('DELETE FROM pastes WHERE id = $1', [id]);

      await client.query('COMMIT');
      return pasteId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply syntax highlighting to content
   */
  highlightContent(content: string, language: string = 'text'): string {
    if (language === 'text' || !language) {
      return content; // No highlighting for plain text
    }

    try {
      const highlighted = hljs.highlight(content, { language }).value;
      return highlighted;
    } catch (error) {
      // If highlighting fails, return original content
      return content;
    }
  }

  /**
   * Flush view counts from Redis to PostgreSQL
   */
  async flushViewCounts(): Promise<void> {
    const { getRedisStatus } = require('../config/redis');
    const redisStatus = getRedisStatus();
    if (!redisStatus.connected) {
      return;
    }

    try {
      const viewKeys = await keys('views:*');

      if (viewKeys.length === 0) {
        return;
      }

      for (const key of viewKeys) {
        const pasteId = key.replace('views:', '');
        const viewCountStr = await get(key);

        if (viewCountStr) {
          const viewCount = parseInt(viewCountStr, 10);

          if (viewCount > 0) {
            // Update PostgreSQL
            await pool.query(
              'UPDATE pastes SET view_count = view_count + $1 WHERE paste_id = $2',
              [viewCount, pasteId]
            );

            // Delete from Redis after flushing
            await del(key);
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('closed') || error?.message?.includes('ClientClosed')) {
        return;
      }
      throw error;
    }
  }
}

