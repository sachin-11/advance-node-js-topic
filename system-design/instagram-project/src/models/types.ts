
export interface Post {
  id?: number;
  user_id: number;
  caption?: string;
  image_url: string;
  thumbnail_url?: string;
  medium_url?: string;
  image_metadata?: any;
  like_count?: number;
  comment_count?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface Follow {
  follower_id: number;
  following_id: number;
  created_at?: Date;
}

export interface Like {
  user_id: number;
  post_id: number;
  created_at?: Date;
}


export interface PostWithUser extends Post {
  user?: {
    id: number;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
  retweet_count?: number;
}

export interface Retweet {
  id?: number;
  user_id: number;
  post_id: number;
  comment?: string;
  created_at?: Date;
}

export interface Hashtag {
  id?: number;
  tag: string;
  post_count?: number;
  created_at?: Date;
}

export interface Mention {
  id?: number;
  post_id?: number;
  comment_id?: number;
  mentioned_user_id: number;
  mentioned_by_user_id: number;
  created_at?: Date;
}

export interface Notification {
  id?: number;
  user_id: number;
  actor_id: number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost';
  post_id?: number;
  comment_id?: number;
  is_read?: boolean;
  created_at?: Date;
}

export interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  media_url?: string;
  is_read?: boolean;
  created_at?: Date;
}

export interface Block {
  blocker_id: number;
  blocked_id: number;
  created_at?: Date;
}

export interface Mute {
  muter_id: number;
  muted_id: number;
  created_at?: Date;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  bio?: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  verified?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Comment {
  id?: number;
  post_id: number;
  user_id: number;
  content: string;
  reply_to_id?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

