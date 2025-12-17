import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contactService';
import { AuthRequest } from '../middleware/auth';

const contactService = new ContactService();

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Add a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const addContact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { phone_number, contact_name } = req.body;

    if (!phone_number) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    const contact = await contactService.addContact(userId, phone_number, contact_name);
    res.status(201).json(contact);
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('yourself')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get user's contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const getUserContacts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const contacts = await contactService.getUserContacts(userId);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts/:phoneNumber:
 *   put:
 *     summary: Update contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const updateContact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const phoneNumber = req.params.phoneNumber;
    const { contact_name, is_blocked } = req.body;

    const contact = await contactService.updateContact(userId, phoneNumber, {
      contact_name,
      is_blocked,
    });
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts/:phoneNumber:
 *   delete:
 *     summary: Delete contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const deleteContact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const phoneNumber = req.params.phoneNumber;

    await contactService.deleteContact(userId, phoneNumber);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts/block:
 *   post:
 *     summary: Block a user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const blockUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await contactService.blockUser(userId, user_id);
    res.json({ message: 'User blocked' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts/unblock:
 *   post:
 *     summary: Unblock a user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const unblockUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await contactService.unblockUser(userId, user_id);
    res.json({ message: 'User unblocked' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/contacts/blocked:
 *   get:
 *     summary: Get blocked users
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 */
export const getBlockedUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const blockedUsers = await contactService.getBlockedUsers(userId);
    res.json(blockedUsers);
  } catch (error) {
    next(error);
  }
};
