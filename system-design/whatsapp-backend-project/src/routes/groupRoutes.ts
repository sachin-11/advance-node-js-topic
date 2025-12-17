import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createGroup,
  getUserGroups,
  getGroup,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController';

const router = Router();

router.post('/', authenticate, createGroup);
router.get('/', authenticate, getUserGroups);
router.get('/:groupId', authenticate, getGroup);
router.post('/:groupId/members', authenticate, addMember);
router.delete('/:groupId/members/:userId', authenticate, removeMember);
router.put('/:groupId', authenticate, updateGroup);
router.delete('/:groupId', authenticate, deleteGroup);

export default router;
