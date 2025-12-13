export interface Paste {
    id?: number;
    paste_id: string;
    title?: string;
    content: string;
    content_location: 'db' | 's3';
    content_url?: string;
    content_size?: number;
    language: string;
    syntax_mode?: string;
    user_id?: number;
    privacy: 'public' | 'private' | 'unlisted';
    password_hash?: string;
    expires_at?: Date;
    max_views?: number;
    burn_after_reading?: boolean;
    viewed_once?: boolean;
    view_count: number;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export interface User {
    id?: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
}
