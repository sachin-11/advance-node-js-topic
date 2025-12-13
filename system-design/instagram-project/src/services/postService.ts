import { PostModel } from '../models/postModel';
import { UserModel } from '../models/userModel';
import { LikeModel } from '../models/likeModel';
import { CommentModel } from '../models/commentModel';
import { Comment } from '../models/types';
import { ImageProcessingService } from './imageProcessingService';
import { StorageService } from './storageService';
import { Post, PostWithUser } from '../models/types';
import pool from '../config/database';

const imageProcessingService = new ImageProcessingService();
const storageService = new StorageService();

export interface CreatePostRequest {
  userId: number;
  caption?: string;
  imageBuffer: Buffer;
}

export class PostService {
  /**
   * Create a new post
   */
  async createPost(request: CreatePostRequest): Promise<PostWithUser> {
    // Validate image
    const validation = imageProcessingService.validateImage(request.imageBuffer);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Process image (generate thumbnails, extract metadata)
    const processedImages = await imageProcessingService.processImage(request.imageBuffer);

    // Create post record first to get post ID
    const post = await PostModel.create({
      user_id: request.userId,
      caption: request.caption,
      image_url: '', // Will be updated after S3 upload
      thumbnail_url: '',
      medium_url: '',
      image_metadata: processedImages.metadata,
    });

    try {
      // Upload images to S3
      const uploadedImages = await storageService.uploadImages(
        request.userId,
        post.id!,
        processedImages
      );

      // Update post with S3 URLs
      const updatedPost = await PostModel.findById(post.id!);
      if (updatedPost) {
        await pool.query(
          'UPDATE posts SET image_url = $1, thumbnail_url = $2, medium_url = $3 WHERE id = $4',
          [
            uploadedImages.originalUrl,
            uploadedImages.thumbnailUrl,
            uploadedImages.mediumUrl,
            post.id,
          ]
        );
      }

      // Increment user's post count
      await UserModel.incrementPostCount(request.userId);

      // Process hashtags and mentions (async, don't wait)
      if (request.caption) {
        setImmediate(async () => {
          try {
            const { HashtagService } = await import('./hashtagService');
            const { MentionService } = await import('./mentionService');

            const hashtagService = new HashtagService();
            const mentionService = new MentionService();

            // Process hashtags
            await hashtagService.processHashtags(request.caption!, post.id!);

            // Process mentions
            await mentionService.processMentions(
              request.caption!,
              request.userId,
              post.id!
            );
          } catch (err: any) {
            console.error('Failed to process hashtags/mentions:', err.message);
          }
        });
      }

      // Add post to all followers' feed caches (async, don't wait)
      // Using dynamic import to avoid circular dependency
      setImmediate(async () => {
        try {
          const { FeedService } = await import('./feedService');
          const feedService = new FeedService();
          await feedService.addPostToFollowersFeeds(post.id!, request.userId);
        } catch (err: any) {
          console.error('Failed to add post to followers feeds:', err.message);
        }
      });

      // Return updated post
      const finalPost = await PostModel.findById(post.id!);
      return finalPost!;
    } catch (error) {
      // If S3 upload fails, delete the post record
      await PostModel.delete(post.id!, request.userId);
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  async getPost(postId: number): Promise<PostWithUser | null> {
    return await PostModel.findById(postId);
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: number, limit: number = 20, offset: number = 0): Promise<Post[]> {
    return await PostModel.findByUserId(userId, limit, offset);
  }

  /**
   * Delete post
   */
  async deletePost(postId: number, userId: number): Promise<boolean> {
    const post = await PostModel.findById(postId);
    if (!post || post.user_id !== userId) {
      return false;
    }

    const deleted = await PostModel.delete(postId, userId);
    if (deleted) {
      // Delete images from S3
      await storageService.deleteImages(userId, postId);
      // Decrement user's post count
      await UserModel.decrementPostCount(userId);

      // Remove hashtags (async)
      setImmediate(async () => {
        try {
          const { HashtagService } = await import('./hashtagService');
          const hashtagService = new HashtagService();
          await hashtagService.removeHashtags(postId);
        } catch (err: any) {
          console.error('Failed to remove hashtags:', err.message);
        }
      });
    }

    return deleted;
  }

  /**
   * Like a post
   */
  async likePost(userId: number, postId: number): Promise<boolean> {
    const exists = await LikeModel.exists(userId, postId);
    if (exists) return false;

    await LikeModel.create(userId, postId);
    await PostModel.incrementLikeCount(postId);

    // Create notification (async)
    setImmediate(async () => {
      try {
        const { NotificationService } = await import('./notificationService');
        const notificationService = new NotificationService();
        const post = await PostModel.findById(postId);
        if (post && post.user_id !== userId) {
          await notificationService.createNotification({
            user_id: post.user_id,
            actor_id: userId,
            type: 'like',
            post_id: postId
          });
        }
      } catch (err) {
        console.error('Failed to create like notification', err);
      }
    });

    return true;
  }

  /**
   * Unlike a post
   */
  async unlikePost(userId: number, postId: number): Promise<boolean> {
    const deleted = await LikeModel.delete(userId, postId);
    if (deleted) {
      await PostModel.decrementLikeCount(postId);
    }
    return deleted;
  }

  /**
   * Add a comment
   */
  async addComment(userId: number, postId: number, content: string): Promise<Comment> {
    const comment = await CommentModel.create({
      user_id: userId,
      post_id: postId,
      content,
    });

    await PostModel.incrementCommentCount(postId);

    // Create notification (async)
    setImmediate(async () => {
      try {
        const { NotificationService } = await import('./notificationService');
        const notificationService = new NotificationService();
        const post = await PostModel.findById(postId);
        if (post && post.user_id !== userId) {
          await notificationService.createNotification({
            user_id: post.user_id,
            actor_id: userId,
            type: 'comment',
            post_id: postId,
            comment_id: comment.id
          });
        }
      } catch (err) {
        console.error('Failed to create comment notification', err);
      }
    });

    return comment;
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number, limit: number = 50, offset: number = 0): Promise<Comment[]> {
    return await CommentModel.findByPostId(postId, limit, offset);
  }
}
