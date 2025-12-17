import { Request, Response, NextFunction } from 'express';
import { GroupService } from '../services/groupService';
import { AuthRequest } from '../middleware/auth';

const groupService = new GroupService();

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, description, member_ids } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const group = await groupService.createGroup(userId, name, description, member_ids || []);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const getUserGroups = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groups = await groupService.getUserGroups(userId);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/groups/:groupId:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const getGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);

    const group = await groupService.getGroupWithMembers(groupId, userId);
    res.json(group);
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('not a member')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/groups/:groupId/members:
 *   post:
 *     summary: Add member to group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const addMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await groupService.addMember(groupId, user_id, userId);
    res.json({ message: 'Member added to group' });
  } catch (error: any) {
    if (error.message.includes('Only admins')) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/groups/:groupId/members/:userId:
 *   delete:
 *     summary: Remove member from group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);
    const memberId = parseInt(req.params.userId);

    await groupService.removeMember(groupId, memberId, userId);
    res.json({ message: 'Member removed from group' });
  } catch (error: any) {
    if (error.message.includes('Only admins') || error.message.includes('not a member')) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/groups/:groupId:
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const updateGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);
    const { name, description, profile_picture_url } = req.body;

    const group = await groupService.updateGroup(groupId, userId, {
      name,
      description,
      profile_picture_url,
    });
    res.json(group);
  } catch (error: any) {
    if (error.message.includes('Only admins')) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/groups/:groupId:
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
export const deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);

    await groupService.deleteGroup(groupId, userId);
    res.json({ message: 'Group deleted' });
  } catch (error: any) {
    if (error.message.includes('Only creator') || error.message.includes('not found')) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
};
