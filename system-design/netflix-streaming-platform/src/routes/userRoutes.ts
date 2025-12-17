import express from 'express';
import { authenticate } from '../middleware/auth';
import { userController } from '../controllers/userController';
import { watchHistoryController } from '../controllers/watchHistoryController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User profile management
 *   - name: Watch History
 *     description: Watch history and continue watching
 */

// Profile routes
router.get('/profiles', userController.getProfiles);
router.post('/profiles', userController.createProfile);
router.get('/profiles/:profileId', userController.getProfile);
router.put('/profiles/:profileId', userController.updateProfile);
router.delete('/profiles/:profileId', userController.deleteProfile);

// Watch history routes
router.get('/watch-history', userController.getWatchHistory);
router.get('/continue-watching', userController.getContinueWatching);
router.post('/watch-history', watchHistoryController.updateWatchHistory);
router.delete('/watch-history/:contentId', watchHistoryController.removeFromHistory);

export default router;