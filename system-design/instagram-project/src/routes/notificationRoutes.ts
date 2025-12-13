import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:id/read', authenticate, markAsRead);
router.put('/notifications/read-all', authenticate, markAllAsRead);
router.get('/notifications/unread', authenticate, getUnreadCount);

export default router;

