import { query, getClient } from '../config/database';
import { get, set, del, zadd } from '../config/redis';
import {
    Tweet,
    TweetWithUser,
    CreateTweetRequest,
    ValidationError,
    NotFoundError,
    AuthorizationError,
} from '../models/types';
import { extractUniqueHashtags } from '../utils/hashtagExtractor';
import { UserService } from './userService';

export class TweetService {
    private readonly CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600');
    private readonly MAX_TWEET_LENGTH = parseInt(process.env.MAX_TWEET_LENGTH || '280');
    private readonly userService = new UserService();

    /**
     * Create a new tweet
     */
    async createTweet(userId: number, request: CreateTweetRequest): Promise<TweetWithUser> {
        // Validate content
        if (!request.content || request.content.trim().length === 0) {
            throw new ValidationError('Tweet content cannot be empty');
        }

        if (request.content.length > this.MAX_TWEET_LENGTH) {
            throw new ValidationError(`Tweet content must be ${this.MAX_TWEET_LENGTH} characters or less`);
        }

        // Extract hashtags
        const hashtags = extractUniqueHashtags(request.content);

        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Create tweet
            const tweetResult = await client.query(
                `INSERT INTO tweets (user_id, content, media_urls, reply_to_id, quote_tweet_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
                [
                    userId,
                    request.content,
                    request.media_urls ? JSON.stringify(request.media_urls) : null,
                    request.reply_to_id || null,
                    request.quote_tweet_id || null,
                ]
            );

            const tweet = tweetResult.rows[0];

            // Process hashtags
            for (const tag of hashtags) {
                // Insert or get hashtag
                const hashtagResult = await client.query(
                    `INSERT INTO hashtags (tag) VALUES ($1)
           ON CONFLICT (tag) DO UPDATE SET tweet_count = hashtags.tweet_count + 1
           RETURNING id`,
                    [tag]
                );

                const hashtagId = hashtagResult.rows[0].id;

                // Link tweet to hashtag
                await client.query(
                    'INSERT INTO tweet_hashtags (tweet_id, hashtag_id) VALUES ($1, $2)',
                    [tweet.id, hashtagId]
                );
            }

            // Update user tweet count
            await client.query(
                'UPDATE users SET tweet_count = tweet_count + 1 WHERE id = $1',
                [userId]
            );

            // If it's a reply, increment reply count
            if (request.reply_to_id) {
                await client.query(
                    'UPDATE tweets SET reply_count = reply_count + 1 WHERE id = $1',
                    [request.reply_to_id]
                );
            }

            await client.query('COMMIT');

            // Get user info
            const user = await this.userService.getUserById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Cache the tweet
            await set(`tweet:${tweet.id}`, JSON.stringify(tweet), this.CACHE_TTL);

            // Fan-out to followers' timelines (async - will be handled by worker)
            // For now, we'll add to Redis for the worker to process
            await zadd('pending:fanout', Date.now(), tweet.id.toString());

            return {
                ...tweet,
                media_urls: tweet.media_urls || null,
                user,
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get tweet by ID
     */
    async getTweetById(tweetId: number, currentUserId?: number): Promise<TweetWithUser | null> {
        // Check cache
        const cacheKey = `tweet:${tweetId}`;
        const cached = await get(cacheKey);

        let tweet: Tweet;

        if (cached) {
            console.log(`✅ Cache HIT: tweet:${tweetId}`);
            tweet = JSON.parse(cached);
        } else {
            console.log(`❌ Cache MISS: tweet:${tweetId}`);

            const tweets = await query<Tweet>(
                'SELECT * FROM tweets WHERE id = $1 AND is_deleted = FALSE',
                [tweetId]
            );

            if (tweets.length === 0) {
                return null;
            }

            tweet = tweets[0];
            await set(cacheKey, JSON.stringify(tweet), this.CACHE_TTL);
        }

        // Get user info
        const user = await this.userService.getUserById(tweet.user_id);
        if (!user) {
            return null;
        }

        // Check if current user liked/retweeted
        let is_liked = false;
        let is_retweeted = false;

        if (currentUserId) {
            const likes = await query(
                'SELECT 1 FROM likes WHERE user_id = $1 AND tweet_id = $2',
                [currentUserId, tweetId]
            );
            is_liked = likes.length > 0;

            const retweets = await query(
                'SELECT 1 FROM retweets WHERE user_id = $1 AND tweet_id = $2',
                [currentUserId, tweetId]
            );
            is_retweeted = retweets.length > 0;
        }

        return {
            ...tweet,
            user,
            is_liked,
            is_retweeted,
        };
    }

    /**
     * Delete tweet
     */
    async deleteTweet(tweetId: number, userId: number): Promise<void> {
        // Check if tweet exists and belongs to user
        const tweets = await query<Tweet>(
            'SELECT user_id FROM tweets WHERE id = $1 AND is_deleted = FALSE',
            [tweetId]
        );

        if (tweets.length === 0) {
            throw new NotFoundError('Tweet not found');
        }

        if (tweets[0].user_id !== userId) {
            throw new AuthorizationError('You can only delete your own tweets');
        }

        // Soft delete
        await query(
            'UPDATE tweets SET is_deleted = TRUE WHERE id = $1',
            [tweetId]
        );

        // Update user tweet count
        await query(
            'UPDATE users SET tweet_count = tweet_count - 1 WHERE id = $1 AND tweet_count > 0',
            [userId]
        );

        // Invalidate cache
        await del(`tweet:${tweetId}`);
    }

    /**
     * Get user's tweets
     */
    async getUserTweets(
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

        const user = await this.userService.getUserById(userId);
        if (!user) {
            return [];
        }

        return tweets.map(tweet => ({
            ...tweet,
            user,
        }));
    }

    /**
     * Get tweet replies
     */
    async getTweetReplies(
        tweetId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<TweetWithUser[]> {
        const tweets = await query<Tweet>(
            `SELECT * FROM tweets
       WHERE reply_to_id = $1 AND is_deleted = FALSE
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [tweetId, limit, offset]
        );

        // Get user info for each tweet
        const tweetsWithUsers: TweetWithUser[] = [];
        for (const tweet of tweets) {
            const user = await this.userService.getUserById(tweet.user_id);
            if (user) {
                tweetsWithUsers.push({ ...tweet, user });
            }
        }

        return tweetsWithUsers;
    }
}
