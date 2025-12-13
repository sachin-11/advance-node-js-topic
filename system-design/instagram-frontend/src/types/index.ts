export interface User {
    id: number;
    username: string;
    email: string;
    bio?: string;
    avatar_url?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
}

export interface Post {
    id: number;
    user_id: number;
    image_url: string;
    thumbnail_url?: string;
    medium_url?: string;
    caption?: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    user?: User; // Made optional as it's not in the getUserPosts response item
}

export interface AuthResponse {
    user: User;
    token: string;
}
