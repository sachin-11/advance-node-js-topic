import { ChatModel } from '../models/chatModel';
import { MessageModel } from '../models/messageModel';
import { UserModel } from '../models/userModel';
import { BlockedUserModel } from '../models/contactModel';
import { Chat, ChatWithUser, MessageWithSender } from '../models/types';

export class ChatService {
  /**
   * Get or create a chat between two users
   */
  async getOrCreateChat(user1Id: number, user2Id: number): Promise<Chat> {
    // Check if blocked
    const isBlocked = await BlockedUserModel.isBlocked(user1Id, user2Id);
    if (isBlocked) {
      throw new Error('Cannot create chat with blocked user');
    }

    let chat = await ChatModel.findByUsers(user1Id, user2Id);
    
    if (!chat) {
      chat = await ChatModel.create({
        user1_id: user1Id,
        user2_id: user2Id,
      });
    }

    return chat;
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: number, limit: number = 50, offset: number = 0): Promise<ChatWithUser[]> {
    const chats = await ChatModel.findByUserId(userId, limit, offset);
    
    const chatsWithUsers: ChatWithUser[] = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
        const otherUser = await UserModel.findById(otherUserId);
        
        let lastMessage: MessageWithSender | undefined;
        if (chat.last_message_id) {
          const message = await MessageModel.findById(chat.last_message_id);
          if (message) {
            const sender = await UserModel.findById(message.sender_id);
            lastMessage = {
              ...message,
              sender: sender ? {
                id: sender.id!,
                phone_number: sender.phone_number,
                username: sender.username,
                full_name: sender.full_name,
                profile_picture_url: sender.profile_picture_url,
              } : undefined,
            };
          }
        }

        const unreadCount = await ChatModel.getUnreadCount(chat.id!, userId);

        return {
          ...chat,
          other_user: otherUser ? {
            id: otherUser.id!,
            phone_number: otherUser.phone_number,
            username: otherUser.username,
            full_name: otherUser.full_name,
            profile_picture_url: otherUser.profile_picture_url,
            is_online: otherUser.is_online,
            last_seen: otherUser.last_seen,
          } : undefined,
          last_message: lastMessage,
          unread_count: unreadCount,
        };
      })
    );

    return chatsWithUsers;
  }

  /**
   * Get chat messages
   */
  async getChatMessages(
    chatId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageWithSender[]> {
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Verify user is part of the chat
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      throw new Error('Unauthorized access to chat');
    }

    const messages = await MessageModel.findByChatId(chatId, limit, offset);
    
    const messagesWithSenders: MessageWithSender[] = await Promise.all(
      messages.map(async (message) => {
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
   * Mark chat as read
   */
  async markChatAsRead(chatId: number, userId: number): Promise<void> {
    await ChatModel.markAsRead(chatId, userId);
  }
}
