import { GroupModel, GroupMemberModel } from '../models/groupModel';
import { UserModel } from '../models/userModel';
import { Group, GroupWithMembers } from '../models/types';

export class GroupService {
  /**
   * Create a new group
   */
  async createGroup(
    creatorId: number,
    name: string,
    description?: string,
    memberIds: number[] = []
  ): Promise<GroupWithMembers> {
    // Create group
    const group = await GroupModel.create({
      name,
      description,
      created_by: creatorId,
    });

    // Add creator as admin
    await GroupMemberModel.addMember(group.id!, creatorId, 'admin');

    // Add other members
    for (const memberId of memberIds) {
      if (memberId !== creatorId) {
        await GroupMemberModel.addMember(group.id!, memberId, 'member');
      }
    }

    return await this.getGroupWithMembers(group.id!, creatorId);
  }

  /**
   * Get group with members
   */
  async getGroupWithMembers(groupId: number, userId: number): Promise<GroupWithMembers> {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Verify user is member
    const member = await GroupMemberModel.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    const members = await GroupMemberModel.findByGroupId(groupId);
    
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await UserModel.findById(m.user_id);
        return {
          ...m,
          user: user ? {
            id: user.id!,
            phone_number: user.phone_number,
            username: user.username,
            full_name: user.full_name,
            profile_picture_url: user.profile_picture_url,
          } : undefined,
        };
      })
    );

    return {
      ...group,
      members: membersWithUsers,
      member_count: members.length,
    };
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: number): Promise<GroupWithMembers[]> {
    const groups = await GroupModel.findByUserId(userId);
    
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        return await this.getGroupWithMembers(group.id!, userId);
      })
    );

    return groupsWithMembers;
  }

  /**
   * Add member to group
   */
  async addMember(groupId: number, userId: number, addedBy: number): Promise<void> {
    // Verify adder is admin
    const adder = await GroupMemberModel.findByGroupAndUser(groupId, addedBy);
    if (!adder || adder.role !== 'admin') {
      throw new Error('Only admins can add members');
    }

    await GroupMemberModel.addMember(groupId, userId, 'member');
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: number, userId: number, removedBy: number): Promise<void> {
    // Verify remover is admin or removing themselves
    const remover = await GroupMemberModel.findByGroupAndUser(groupId, removedBy);
    if (!remover) {
      throw new Error('User is not a member of this group');
    }

    if (remover.role !== 'admin' && userId !== removedBy) {
      throw new Error('Only admins can remove other members');
    }

    await GroupMemberModel.removeMember(groupId, userId);
  }

  /**
   * Update group
   */
  async updateGroup(
    groupId: number,
    userId: number,
    updates: Partial<Group>
  ): Promise<Group> {
    // Verify user is admin
    const member = await GroupMemberModel.findByGroupAndUser(groupId, userId);
    if (!member || member.role !== 'admin') {
      throw new Error('Only admins can update group');
    }

    const group = await GroupModel.update(groupId, updates);
    if (!group) {
      throw new Error('Failed to update group');
    }

    return group;
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: number, userId: number): Promise<void> {
    // Verify user is creator
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.created_by !== userId) {
      throw new Error('Only creator can delete group');
    }

    await GroupModel.delete(groupId);
  }
}
