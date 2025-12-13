import { query } from '../config/database';
import { get, set, del } from '../config/redis';
import {
    User,
    UserProfile,
    NotFoundError,
    ValidationError,
} from '../models/types';

export class UserService {
    private readonly CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600');

    /**
     * Get user by ID
     */
    async getUserById(userId: number): Promise<UserProfile | null> {
        // Check cache first
        const cacheKey = `user:${userId}`;
        const cached = await get(cacheKey);

        if (cached) {
            console.log(`✅ Cache HIT: user:${userId}`);
            return JSON.parse(cached);
        }

        console.log(`❌ Cache MISS: user:${userId}`);

        // Query database
        const users = await query<User>(
            `SELECT id, username, email, display_name, bio, avatar_url, cover_url,
              verified, follower_count, following_count, tweet_count,
              location, website, created_at
       FROM users
       WHERE id = $1 AND is_active = TRUE`,
            [userId]
        );

        if (users.length === 0) {
            return null;
        }

        const user = users[0];
        const userProfile = this.toUserProfile(user);

        // Cache the result
        await set(cacheKey, JSON.stringify(userProfile), this.CACHE_TTL);

        return userProfile;
    }

    /**
     * Get user by username
     */
    async getUserByUsername(username: string): Promise<UserProfile | null> {
        const users = await query<User>(
            `SELECT id, username, email, display_name, bio, avatar_url, cover_url,
              verified, follower_count, following_count, tweet_count,
              location, website, created_at
       FROM users
       WHERE username = $1 AND is_active = TRUE`,
            [username]
        );

        if (users.length === 0) {
            return null;
        }

        return this.toUserProfile(users[0]);
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: number,
        updates: {
            display_name?: string;
            bio?: string;
            location?: string;
            website?: string;
            avatar_url?: string;
            cover_url?: string;
        }
    ): Promise<UserProfile> {
        // Validate updates
        if (updates.display_name && updates.display_name.length > 100) {
            throw new ValidationError('Display name must be less than 100 characters');
        }

        if (updates.bio && updates.bio.length > 500) {
            throw new ValidationError('Bio must be less than 500 characters');
        }

        if (updates.website && !this.isValidUrl(updates.website)) {
            throw new ValidationError('Invalid website URL');
        }

        // Build update query dynamically
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.display_name !== undefined) {
            fields.push(`display_name = $${paramIndex++}`);
            values.push(updates.display_name);
        }
        if (updates.bio !== undefined) {
            fields.push(`bio = $${paramIndex++}`);
            values.push(updates.bio);
        }
        if (updates.location !== undefined) {
            fields.push(`location = $${paramIndex++}`);
            values.push(updates.location);
        }
        if (updates.website !== undefined) {
            fields.push(`website = $${paramIndex++}`);
            values.push(updates.website);
        }
        if (updates.avatar_url !== undefined) {
            fields.push(`avatar_url = $${paramIndex++}`);
            values.push(updates.avatar_url);
        }
        if (updates.cover_url !== undefined) {
            fields.push(`cover_url = $${paramIndex++}`);
            values.push(updates.cover_url);
        }

        if (fields.length === 0) {
            throw new ValidationError('No fields to update');
        }

        values.push(userId);

        const users = await query<User>(
            `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND is_active = TRUE
       RETURNING id, username, email, display_name, bio, avatar_url, cover_url,
                 verified, follower_count, following_count, tweet_count,
                 location, website, created_at`,
            values
        );

        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        const user = users[0];
        const userProfile = this.toUserProfile(user);

        // Invalidate cache
        await del(`user:${userId}`);

        return userProfile;
    }

    /**
     * Search users by username or display name
     */
    async searchUsers(
        query_text: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<UserProfile[]> {
        if (!query_text || query_text.trim().length === 0) {
            return [];
        }

        const searchPattern = `%${query_text.toLowerCase()}%`;

        const users = await query<User>(
            `SELECT id, username, email, display_name, bio, avatar_url, cover_url,
              verified, follower_count, following_count, tweet_count,
              location, website, created_at
       FROM users
       WHERE (LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1)
         AND is_active = TRUE
       ORDER BY 
         CASE WHEN verified THEN 0 ELSE 1 END,
         follower_count DESC
       LIMIT $2 OFFSET $3`,
            [searchPattern, limit, offset]
        );

        return users.map(user => this.toUserProfile(user));
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: number): Promise<{
        follower_count: number;
        following_count: number;
        tweet_count: number;
    }> {
        const users = await query<User>(
            `SELECT follower_count, following_count, tweet_count
       FROM users
       WHERE id = $1 AND is_active = TRUE`,
            [userId]
        );

        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        return {
            follower_count: users[0].follower_count,
            following_count: users[0].following_count,
            tweet_count: users[0].tweet_count,
        };
    }

    /**
     * Increment user tweet count
     */
    async incrementTweetCount(userId: number): Promise<void> {
        await query(
            'UPDATE users SET tweet_count = tweet_count + 1 WHERE id = $1',
            [userId]
        );

        // Invalidate cache
        await del(`user:${userId}`);
    }

    /**
     * Decrement user tweet count
     */
    async decrementTweetCount(userId: number): Promise<void> {
        await query(
            'UPDATE users SET tweet_count = tweet_count - 1 WHERE id = $1 AND tweet_count > 0',
            [userId]
        );

        // Invalidate cache
        await del(`user:${userId}`);
    }

    /**
     * Validate URL format
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Convert User to UserProfile
     */
    private toUserProfile(user: User): UserProfile {
        return {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            bio: user.bio,
            avatar_url: user.avatar_url,
            cover_url: user.cover_url,
            verified: user.verified,
            follower_count: user.follower_count,
            following_count: user.following_count,
            tweet_count: user.tweet_count,
            location: user.location,
            website: user.website,
            created_at: user.created_at,
        };
    }
}
