import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserProfile, getCurrentUser, updateProfile, searchUsers } from '../controllers/userController';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateProfile);
router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, getUserProfile);

export default router;
