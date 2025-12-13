import { NotificationModel } from '../models/notificationModel';

export class NotificationService {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: number, limit: number = 20, offset: number = 0) {
    return await NotificationModel.findByUserId(userId, limit, offset);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    return await NotificationModel.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<number> {
    return await NotificationModel.markAllAsRead(userId);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await NotificationModel.getUnreadCount(userId);
  }

  /**
   * Create notification
   */
  async createNotification(notification: {
    user_id: number;
    actor_id: number;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'repost';
    post_id?: number;
    comment_id?: number;
  }): Promise<void> {
    try {
      await NotificationModel.create(notification);
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }
}

