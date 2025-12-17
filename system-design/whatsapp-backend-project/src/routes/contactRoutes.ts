import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addContact,
  getUserContacts,
  updateContact,
  deleteContact,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/contactController';

const router = Router();

router.post('/', authenticate, addContact);
router.get('/', authenticate, getUserContacts);
router.put('/:phoneNumber', authenticate, updateContact);
router.delete('/:phoneNumber', authenticate, deleteContact);
router.post('/block', authenticate, blockUser);
router.post('/unblock', authenticate, unblockUser);
router.get('/blocked', authenticate, getBlockedUsers);

export default router;
