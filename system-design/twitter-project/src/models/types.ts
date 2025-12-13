// User Types
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    verified: boolean;
    follower_count: number;
    following_count: number;
    tweet_count: number;
    location: string | null;
    website: string | null;
    birth_date: Date | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserProfile {
    id: number;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    verified: boolean;
    follower_count: number;
    following_count: number;
    tweet_count: number;
    location: string | null;
    website: string | null;
    created_at: Date;
}

// Tweet Types
export interface Tweet {
    id: number;
    user_id: number;
    content: string;
    media_urls: string[] | null;
    reply_to_id: number | null;
    retweet_id: number | null;
    quote_tweet_id: number | null;
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface TweetWithUser extends Tweet {
    user: UserProfile;
    is_liked?: boolean;
    is_retweeted?: boolean;
}

// Follow Types
export interface Follow {
    follower_id: number;
    following_id: number;
    created_at: Date;
}

// Like Types
export interface Like {
    user_id: number;
    tweet_id: number;
    created_at: Date;
}

// Retweet Types
export interface Retweet {
    id: number;
    user_id: number;
    tweet_id: number;
    comment: string | null;
    created_at: Date;
}

// Hashtag Types
export interface Hashtag {
    id: number;
    tag: string;
    tweet_count: number;
    created_at: Date;
}

// Notification Types
export type NotificationType = 'like' | 'retweet' | 'reply' | 'follow' | 'mention';

export interface Notification {
    id: number;
    user_id: number;
    actor_id: number;
    type: NotificationType;
    tweet_id: number | null;
    is_read: boolean;
    created_at: Date;
}

export interface NotificationWithActor extends Notification {
    actor: UserProfile;
    tweet?: Tweet;
}

// Direct Message Types
export interface DirectMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    media_url: string | null;
    is_read: boolean;
    created_at: Date;
}

// Request/Response Types
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    display_name?: string;
    bio?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}

export interface CreateTweetRequest {
    content: string;
    media_urls?: string[];
    reply_to_id?: number;
    quote_tweet_id?: number;
}

export interface TimelineQuery {
    limit?: number;
    offset?: number;
    max_id?: number;
    since_id?: number;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        limit: number;
        offset: number;
        has_more: boolean;
        total?: number;
    };
}

// Error Types
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(401, message);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Not authorized') {
        super(403, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(404, message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Rate limit exceeded') {
        super(429, message);
    }
}
