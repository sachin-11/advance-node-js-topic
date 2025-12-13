import { MuteModel } from '../models/muteModel';
import { UserModel } from '../models/userModel';

export class MuteService {
  /**
   * Mute a user
   */
  async muteUser(muterId: number, mutedId: number): Promise<void> {
    // Check if trying to mute self
    if (muterId === mutedId) {
      throw new Error('Cannot mute yourself');
    }

    // Check if user exists
    const user = await UserModel.findById(mutedId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already muted
    const isAlreadyMuted = await MuteModel.isMuted(muterId, mutedId);
    if (isAlreadyMuted) {
      throw new Error('User already muted');
    }

    // Create mute relationship
    await MuteModel.create({
      muter_id: muterId,
      muted_id: mutedId,
    });
  }

  /**
   * Unmute a user
   */
  async unmuteUser(muterId: number, mutedId: number): Promise<void> {
    const deleted = await MuteModel.delete(muterId, mutedId);
    if (!deleted) {
      throw new Error('User not muted');
    }
  }

  /**
   * Check if user is muted
   */
  async isMuted(muterId: number, mutedId: number): Promise<boolean> {
    return await MuteModel.isMuted(muterId, mutedId);
  }

  /**
   * Get muted users list
   */
  async getMutedUsers(userId: number, limit: number = 20, offset: number = 0) {
    return await MuteModel.getMutedUsers(userId, limit, offset);
  }
}

