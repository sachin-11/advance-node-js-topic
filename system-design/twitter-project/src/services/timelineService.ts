import { query } from '../config/database';
import { get, set, zrevrange } from '../config/redis';
import { Tweet, TweetWithUser } from '../models/types';
import { UserService } from './userService';
import { FollowService } from './followService';

export class TimelineService {
    private readonly CACHE_TTL = parseInt(process.env.TIMELINE_CACHE_TTL_SECONDS || '300');
    private readonly userService = new UserService();
    private readonly followService = new FollowService();

    /**
     * Get home timeline (tweets from followed users)
     */
    async getHomeTimeline(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<TweetWithUser[]> {
        // Check cache
        const cacheKey = `timeline:${userId}`;
        const cachedIds = await zrevrange(cacheKey, offset, offset + limit - 1);

        if (cachedIds.length > 0) {
            console.log(`✅ Timeline cache HIT for user ${userId}`);
            return await this.getTweetsByIds(cachedIds.map(id => parseInt(id)));
        }

        console.log(`❌ Timeline cache MISS for user ${userId}`);

        // Get following IDs
        const followingIds = await this.followService.getFollowingIds(userId);

        if (followingIds.length === 0) {
            return [];
        }

        // Query tweets from followed users
        const placeholders = followingIds.map((_, i) => `$${i + 1}`).join(',');
        const tweets = await query<Tweet>(
            `SELECT * FROM tweets
       WHERE user_id IN (${placeholders})
         AND is_deleted = FALSE
       ORDER BY created_at DESC
       LIMIT $${followingIds.length + 1} OFFSET $${followingIds.length + 2}`,
            [...followingIds, limit, offset]
        );

        // Enrich with user data
        const tweetsWithUsers = await this.enrichTweetsWithUsers(tweets);

        return tweetsWithUsers;
    }

    /**
     * Get user timeline (specific user's tweets)
     */
    async getUserTimeline(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<TweetWithUser[]> {
        const tweets = await query<Tweet>(
            `SELECT * FROM tweets
       WHERE user_id = $1 AND is_deleted = FALSE
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return await this.enrichTweetsWithUsers(tweets);
    }

    /**
     * Enrich tweets with user data
     */
    private async enrichTweetsWithUsers(tweets: Tweet[]): Promise<TweetWithUser[]> {
        const tweetsWithUsers: TweetWithUser[] = [];

        for (const tweet of tweets) {
            const user = await this.userService.getUserById(tweet.user_id);
            if (user) {
                tweetsWithUsers.push({ ...tweet, user });
            }
        }

        return tweetsWithUsers;
    }

    /**
     * Get tweets by IDs (for cache retrieval)
     */
    private async getTweetsByIds(tweetIds: number[]): Promise<TweetWithUser[]> {
        if (tweetIds.length === 0) return [];

        const placeholders = tweetIds.map((_, i) => `$${i + 1}`).join(',');
        const tweets = await query<Tweet>(
            `SELECT * FROM tweets
       WHERE id IN (${placeholders}) AND is_deleted = FALSE
       ORDER BY created_at DESC`,
            tweetIds
        );

        return await this.enrichTweetsWithUsers(tweets);
    }
}
