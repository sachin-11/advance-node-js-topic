import { MentionModel } from '../models/mentionModel';
import { NotificationModel } from '../models/notificationModel';
import { UserModel } from '../models/userModel';
import { extractMentions, isValidMention } from '../utils/textParser';

export class MentionService {
  /**
   * Process mentions from text and create mention records
   */
  async processMentions(
    text: string,
    mentionedByUserId: number,
    postId?: number,
    commentId?: number
  ): Promise<void> {
    if (!text) return;

    const mentions = extractMentions(text);

    for (const username of mentions) {
      if (!isValidMention(username)) {
        continue; // Skip invalid mentions
      }

      try {
        // Find user by username
        const user = await UserModel.findByUsername(username);
        if (!user || user.id === mentionedByUserId) {
          continue; // User not found or self-mention
        }

        // Create mention record
        await MentionModel.create({
          post_id: postId,
          comment_id: commentId,
          mentioned_user_id: user.id!,
          mentioned_by_user_id: mentionedByUserId,
        });

        // Create notification
        await NotificationModel.create({
          user_id: user.id!,
          actor_id: mentionedByUserId,
          type: 'mention',
          post_id: postId,
          comment_id: commentId,
        });
      } catch (error) {
        console.error(`Failed to process mention @${username}:`, error);
        // Continue with other mentions
      }
    }
  }

  /**
   * Get mentions for a user
   */
  async getUserMentions(userId: number, limit: number = 20, offset: number = 0) {
    return await MentionModel.findByUserId(userId, limit, offset);
  }

  /**
   * Get unread mention count
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await MentionModel.countUnread(userId);
  }
}

