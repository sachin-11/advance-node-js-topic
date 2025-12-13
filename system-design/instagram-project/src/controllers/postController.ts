import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PostService } from '../services/postService';

const postService = new PostService();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post with photo upload
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, or WebP, max 10MB)
 *               caption:
 *                 type: string
 *                 description: Optional caption for the post
 *                 example: My first post!
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 123
 *               user_id: 1
 *               caption: My first post!
 *               image_url: https://cdn.instagram.com/posts/1/123_original_1234567890.jpg
 *               thumbnail_url: https://cdn.instagram.com/posts/1/123_thumbnail_1234567890.jpg
 *               medium_url: https://cdn.instagram.com/posts/1/123_medium_1234567890.jpg
 *               like_count: 0
 *               comment_count: 0
 *               created_at: 2024-01-01T12:00:00.000Z
 *       400:
 *         description: Invalid file or missing image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Upload rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const { caption } = req.body;

    const post = await postService.createPost({
      userId: req.userId,
      caption,
      imageBuffer: req.file.buffer,
    });

    res.status(201).json(post);
  } catch (error: any) {
    if (error.message.includes('exceeds') || error.message.includes('Invalid')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.getPost(postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       404:
 *         description: Post not found or no permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const deleted = await postService.deletePost(postId, req.userId);

    if (!deleted) {
      res.status(404).json({ error: 'Post not found or you do not have permission to delete it' });
      return;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/users/{id}/posts:
 *   get:
 *     summary: Get user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: User's posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const posts = await postService.getUserPosts(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       400:
 *         description: Post already liked or invalid ID
 */
export const likePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await postService.likePost(req.userId, postId);
    if (!result) {
      // Didnt like, maybe already liked
      res.status(400).json({ message: 'Post already liked' });
      return;
    }
    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}/like:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post unliked successfully
 */
export const unlikePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    await postService.unlikePost(req.userId, postId);
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */
export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const comments = await postService.getComments(postId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
export const addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const comment = await postService.addComment(req.userId, postId, content);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

