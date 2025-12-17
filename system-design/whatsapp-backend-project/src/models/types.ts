export interface User {
  id?: number;
  phone_number: string;
  username?: string;
  email?: string;
  password_hash: string;
  full_name?: string;
  profile_picture_url?: string;
  status_message?: string;
  last_seen?: Date;
  is_online?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contact {
  id?: number;
  user_id: number;
  contact_phone_number: string;
  contact_name?: string;
  is_blocked?: boolean;
  created_at?: Date;
}

export interface Chat {
  id?: number;
  user1_id: number;
  user2_id: number;
  last_message_id?: number;
  last_message_at?: Date;
  user1_unread_count?: number;
  user2_unread_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Group {
  id?: number;
  name: string;
  description?: string;
  profile_picture_url?: string;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface GroupMember {
  id?: number;
  group_id: number;
  user_id: number;
  role?: string; // 'admin', 'member'
  unread_count?: number;
  joined_at?: Date;
}

export interface Message {
  id?: number;
  chat_id?: number;
  group_id?: number;
  sender_id: number;
  content?: string;
  message_type?: string; // 'text', 'image', 'video', 'audio', 'document', 'location'
  media_url?: string;
  media_thumbnail_url?: string;
  media_size?: number;
  media_duration?: number;
  location_latitude?: number;
  location_longitude?: number;
  reply_to_message_id?: number;
  is_forwarded?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MessageStatus {
  id?: number;
  message_id: number;
  user_id: number;
  status?: string; // 'sent', 'delivered', 'read'
  updated_at?: Date;
}

export interface BlockedUser {
  id?: number;
  blocker_id: number;
  blocked_id: number;
  created_at?: Date;
}

export interface MessageWithSender extends Message {
  sender?: {
    id: number;
    phone_number: string;
    username?: string;
    full_name?: string;
    profile_picture_url?: string;
  };
  status?: string;
}

export interface ChatWithUser extends Chat {
  other_user?: {
    id: number;
    phone_number: string;
    username?: string;
    full_name?: string;
    profile_picture_url?: string;
    is_online?: boolean;
    last_seen?: Date;
  };
  last_message?: Message;
}

export interface GroupWithMembers extends Group {
  members?: Array<{
    id: number;
    user_id: number;
    role: string;
    user?: {
      id: number;
      phone_number: string;
      username?: string;
      full_name?: string;
      profile_picture_url?: string;
    };
  }>;
  member_count?: number;
}
