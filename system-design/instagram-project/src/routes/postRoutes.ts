import { Router } from 'express';
import { createPost, getPost, deletePost, getUserPosts, likePost, unlikePost, getComments, addComment } from '../controllers/postController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, uploadRateLimiter(), upload.single('image'), createPost);
router.get('/users/:id/posts', authenticate, getUserPosts); // Must be before /:id route
router.get('/:id', authenticate, getPost);
router.delete('/:id', authenticate, deletePost);

// Interactions
router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);
router.get('/:id/comments', authenticate, getComments);
router.post('/:id/comments', authenticate, addComment);

export default router;

