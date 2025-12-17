import { MessageModel } from '../models/messageModel';
import { GroupMemberModel } from '../models/groupModel';
import { BlockedUserModel } from '../models/contactModel';
import { Message, MessageWithSender } from '../models/types';

export class MessageService {
  /**
   * Send a message in a chat
   */
  async sendChatMessage(
    senderId: number,
    receiverId: number,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
    mediaThumbnailUrl?: string,
    mediaSize?: number,
    mediaDuration?: number,
    replyToMessageId?: number
  ): Promise<MessageWithSender> {
    // Check if blocked
    const isBlocked = await BlockedUserModel.isBlocked(senderId, receiverId);
    if (isBlocked) {
      throw new Error('Cannot send message to blocked user');
    }

    // Get or create chat
    const { ChatModel } = await import('../models/chatModel');
    let chat = await ChatModel.findByUsers(senderId, receiverId);
    
    if (!chat) {
      chat = await ChatModel.create({
        user1_id: senderId,
        user2_id: receiverId,
      });
    }

    // Create message
    const message = await MessageModel.create({
      chat_id: chat.id,
      sender_id: senderId,
      content,
      message_type: messageType,
      media_url: mediaUrl,
      media_thumbnail_url: mediaThumbnailUrl,
      media_size: mediaSize,
      media_duration: mediaDuration,
      reply_to_message_id: replyToMessageId,
    });

    // Update chat last message
    await ChatModel.updateLastMessage(chat.id!, message.id!, receiverId);

    // Create message status
    await MessageModel.updateStatus(message.id!, receiverId, 'sent');

    return message as MessageWithSender;
  }

  /**
   * Send a message in a group
   */
  async sendGroupMessage(
    senderId: number,
    groupId: number,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
    mediaThumbnailUrl?: string,
    mediaSize?: number,
    mediaDuration?: number,
    replyToMessageId?: number
  ): Promise<MessageWithSender> {
    // Verify user is member of group
    const member = await GroupMemberModel.findByGroupAndUser(groupId, senderId);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    // Create message
    const message = await MessageModel.create({
      group_id: groupId,
      sender_id: senderId,
      content,
      message_type: messageType,
      media_url: mediaUrl,
      media_thumbnail_url: mediaThumbnailUrl,
      media_size: mediaSize,
      media_duration: mediaDuration,
      reply_to_message_id: replyToMessageId,
    });

    // Get all group members except sender
    const members = await GroupMemberModel.findByGroupId(groupId);
    const otherMembers = members.filter(m => m.user_id !== senderId);

    // Create message status for all members
    for (const member of otherMembers) {
      await MessageModel.updateGroupMessageStatus(message.id!, member.user_id, 'sent');
      await GroupMemberModel.incrementUnreadCount(groupId, member.user_id);
    }

    return message as MessageWithSender;
  }

  /**
   * Get group messages
   */
  async getGroupMessages(
    groupId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageWithSender[]> {
    // Verify user is member
    const member = await GroupMemberModel.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    const messages = await MessageModel.findByGroupId(groupId, limit, offset);
    
    const messagesWithSenders: MessageWithSender[] = await Promise.all(
      messages.map(async (message) => {
        const { UserModel } = await import('../models/userModel');
        const sender = await UserModel.findById(message.sender_id);
        const status = await MessageModel.getStatus(message.id!, userId);

        return {
          ...message,
          sender: sender ? {
            id: sender.id!,
            phone_number: sender.phone_number,
            username: sender.username,
            full_name: sender.full_name,
            profile_picture_url: sender.profile_picture_url,
          } : undefined,
          status: status?.status,
        };
      })
    );

    return messagesWithSenders;
  }

  /**
   * Update message status (delivered/read)
   */
  async updateMessageStatus(
    messageId: number,
    userId: number,
    status: string
  ): Promise<void> {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.chat_id) {
      // Chat message
      await MessageModel.updateStatus(messageId, userId, status);
      
      if (status === 'read') {
        // Mark chat as read
        await ChatModel.markAsRead(message.chat_id, userId);
      }
    } else if (message.group_id) {
      // Group message
      await MessageModel.updateGroupMessageStatus(messageId, userId, status);
      
      if (status === 'read') {
        // Mark group as read
        await GroupMemberModel.markAsRead(message.group_id, userId);
      }
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can delete
    if (message.sender_id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await MessageModel.delete(messageId);
  }
}
