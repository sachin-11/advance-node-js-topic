import { query, getClient } from '../config/database';
import { del, zadd, zrevrange, zrem } from '../config/redis';
import {
    Follow,
    UserProfile,
    NotFoundError,
    ConflictError,
} from '../models/types';
import { UserService } from './userService';

export class FollowService {
    private readonly userService = new UserService();

    /**
     * Follow a user
     */
    async followUser(followerId: number, followingId: number): Promise<void> {
        // Prevent self-follow
        if (followerId === followingId) {
            throw new ConflictError('Cannot follow yourself');
        }

        // Check if following user exists
        const followingUser = await this.userService.getUserById(followingId);
        if (!followingUser) {
            throw new NotFoundError('User to follow not found');
        }

        // Check if already following
        const existing = await query<Follow>(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );

        if (existing.length > 0) {
            throw new ConflictError('Already following this user');
        }

        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Create follow relationship
            await client.query(
                'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
                [followerId, followingId]
            );

            // Update counters
            await client.query(
                'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
                [followerId]
            );

            await client.query(
                'UPDATE users SET follower_count = follower_count + 1 WHERE id = $1',
                [followingId]
            );

            await client.query('COMMIT');

            // Invalidate caches
            await del(`user:${followerId}`);
            await del(`user:${followingId}`);

            // Add following user's recent tweets to follower's timeline
            // This will be handled by a background worker
            await zadd('pending:timeline_update', Date.now(), `${followerId}:${followingId}`);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Unfollow a user
     */
    async unfollowUser(followerId: number, followingId: number): Promise<void> {
        // Check if following
        const existing = await query<Follow>(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );

        if (existing.length === 0) {
            throw new NotFoundError('Not following this user');
        }

        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Delete follow relationship
            await client.query(
                'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
                [followerId, followingId]
            );

            // Update counters
            await client.query(
                'UPDATE users SET following_count = following_count - 1 WHERE id = $1 AND following_count > 0',
                [followerId]
            );

            await client.query(
                'UPDATE users SET follower_count = follower_count - 1 WHERE id = $1 AND follower_count > 0',
                [followingId]
            );

            await client.query('COMMIT');

            // Invalidate caches
            await del(`user:${followerId}`);
            await del(`user:${followingId}`);
            await del(`timeline:${followerId}`);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get followers list
     */
    async getFollowers(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<UserProfile[]> {
        const follows = await query<{ follower_id: number }>(
            `SELECT follower_id FROM follows
       WHERE following_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const followers: UserProfile[] = [];
        for (const follow of follows) {
            const user = await this.userService.getUserById(follow.follower_id);
            if (user) {
                followers.push(user);
            }
        }

        return followers;
    }

    /**
     * Get following list
     */
    async getFollowing(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<UserProfile[]> {
        const follows = await query<{ following_id: number }>(
            `SELECT following_id FROM follows
       WHERE follower_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const following: UserProfile[] = [];
        for (const follow of follows) {
            const user = await this.userService.getUserById(follow.following_id);
            if (user) {
                following.push(user);
            }
        }

        return following;
    }

    /**
     * Check if user is following another user
     */
    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const result = await query(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );

        return result.length > 0;
    }

    /**
     * Get following IDs (for timeline generation)
     */
    async getFollowingIds(userId: number): Promise<number[]> {
        const follows = await query<{ following_id: number }>(
            'SELECT following_id FROM follows WHERE follower_id = $1',
            [userId]
        );

        return follows.map(f => f.following_id);
    }

    /**
     * Get follower IDs (for fan-out)
     */
    async getFollowerIds(userId: number): Promise<number[]> {
        const follows = await query<{ follower_id: number }>(
            'SELECT follower_id FROM follows WHERE following_id = $1',
            [userId]
        );

        return follows.map(f => f.follower_id);
    }
}
