import { ContactModel, BlockedUserModel } from '../models/contactModel';
import { UserModel } from '../models/userModel';
import { Contact, User } from '../models/types';

export class ContactService {
  /**
   * Add a contact
   */
  async addContact(
    userId: number,
    phoneNumber: string,
    contactName?: string
  ): Promise<Contact> {
    // Check if user exists
    const user = await UserModel.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new Error('User with this phone number not found');
    }

    // Check if trying to add self
    const currentUser = await UserModel.findById(userId);
    if (currentUser?.phone_number === phoneNumber) {
      throw new Error('Cannot add yourself as a contact');
    }

    return await ContactModel.create({
      user_id: userId,
      contact_phone_number: phoneNumber,
      contact_name: contactName,
    });
  }

  /**
   * Get user's contacts
   */
  async getUserContacts(userId: number): Promise<(Contact & { user?: User })[]> {
    const contacts = await ContactModel.findByUserId(userId);
    
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await UserModel.findByPhoneNumber(contact.contact_phone_number);
        return {
          ...contact,
          user: user ? {
            id: user.id!,
            phone_number: user.phone_number,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            profile_picture_url: user.profile_picture_url,
            status_message: user.status_message,
            is_online: user.is_online,
            last_seen: user.last_seen,
          } : undefined,
        };
      })
    );

    return contactsWithUsers;
  }

  /**
   * Update contact
   */
  async updateContact(
    userId: number,
    phoneNumber: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> {
    return await ContactModel.update(userId, phoneNumber, updates);
  }

  /**
   * Delete contact
   */
  async deleteContact(userId: number, phoneNumber: string): Promise<void> {
    await ContactModel.delete(userId, phoneNumber);
  }

  /**
   * Block a user
   */
  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    await BlockedUserModel.block(blockerId, blockedId);
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await BlockedUserModel.unblock(blockerId, blockedId);
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: number): Promise<User[]> {
    const blockedUsers = await BlockedUserModel.getBlockedUsers(userId);
    
    const users = await Promise.all(
      blockedUsers.map(async (blocked) => {
        return await UserModel.findById(blocked.blocked_id);
      })
    );

    return users.filter((u): u is User => u !== null);
  }
}
