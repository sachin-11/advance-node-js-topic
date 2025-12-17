import express from 'express';
import { optionalAuth } from '../middleware/auth';
import { contentController } from '../controllers/contentController';
import { ratingController } from '../controllers/ratingController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Content
 *     description: Content browsing and details
 *   - name: Ratings
 *     description: Content ratings and reviews
 */

// Optional auth for content browsing (to personalize)
router.use(optionalAuth);

// Browse routes
router.get('/browse', contentController.browseContent);
router.get('/categories', contentController.getCategories);
router.get('/categories/:categoryId/content', contentController.getContentByCategory);
router.get('/trending', contentController.getTrending);

// Content details
router.get('/:id', contentController.getContentById);

// Ratings (require auth)
import { authenticate as authMiddleware } from '../middleware/auth';
router.post('/:contentId/rating', authMiddleware, ratingController.rateContent);
router.get('/:contentId/rating', authMiddleware, ratingController.getUserRating);
router.get('/:contentId/ratings', ratingController.getContentRatings);

export default router;