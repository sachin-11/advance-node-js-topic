import { MessageModel } from '../models/messageModel';
import { BlockModel } from '../models/blockModel';

export class MessageService {
  /**
   * Send a direct message
   */
  async sendMessage(
    senderId: number,
    receiverId: number,
    content: string,
    mediaUrl?: string
  ): Promise<any> {
    // Check if trying to message self
    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }

    // Check if receiver has blocked sender
    const isBlocked = await BlockModel.isBlocked(receiverId, senderId);
    if (isBlocked) {
      throw new Error('Cannot send message to this user');
    }

    // Check if sender has blocked receiver
    const hasBlocked = await BlockModel.isBlocked(senderId, receiverId);
    if (hasBlocked) {
      throw new Error('Cannot send message to blocked user');
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 1000) {
      throw new Error('Message content too long (max 1000 characters)');
    }

    // Create message
    const message = await MessageModel.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
      media_url: mediaUrl,
    });

    return message;
  }

  /**
   * Get conversation between two users
   */
  async getConversation(
    userId1: number,
    userId2: number,
    limit: number = 50,
    offset: number = 0
  ) {
    return await MessageModel.getConversation(userId1, userId2, limit, offset);
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: number, limit: number = 20) {
    return await MessageModel.getConversations(userId, limit);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number, userId: number): Promise<boolean> {
    return await MessageModel.markAsRead(messageId, userId);
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(senderId: number, receiverId: number): Promise<number> {
    return await MessageModel.markConversationAsRead(senderId, receiverId);
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await MessageModel.getUnreadCount(userId);
  }
}

