import { Post } from '../types';

export const DUMMY_POSTS: Post[] = [
    {
        id: 1,
        user_id: 101,
        image_url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80',
        caption: 'Beautiful sunset vibes 🌅 #nature #sunset',
        like_count: 124,
        comment_count: 5,
        created_at: new Date().toISOString(),
        user: {
            id: 101,
            username: 'travel_lover',
            email: 'travel@example.com',
            followers_count: 500,
            following_count: 200,
            posts_count: 50,
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80'
        }
    },
    {
        id: 2,
        user_id: 102,
        image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning coffee ☕ #coffee #coding',
        like_count: 89,
        comment_count: 3,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        user: {
            id: 102,
            username: 'dev_life',
            email: 'dev@example.com',
            followers_count: 1200,
            following_count: 300,
            posts_count: 150,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'
        }
    },
    {
        id: 3,
        user_id: 103,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        caption: 'Healthy lunch! 🥗 #foodie',
        like_count: 256,
        comment_count: 12,
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        user: {
            id: 103,
            username: 'foodie_gram',
            email: 'foodie@example.com',
            followers_count: 890,
            following_count: 450,
            posts_count: 320,
            avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&h=100&q=80'
        }
    },
    {
        id: 4,
        user_id: 104,
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        caption: 'Hiking adventures 🏔️ #mountains',
        like_count: 432,
        comment_count: 45,
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        user: {
            id: 104,
            username: 'mountain_hiker',
            email: 'hiker@example.com',
            followers_count: 2100,
            following_count: 150,
            posts_count: 95,
            avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100&q=80'
        }
    },
    {
        id: 5,
        user_id: 105,
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        caption: 'Just another day 📸 #portrait',
        like_count: 67,
        comment_count: 2,
        created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        user: {
            id: 105,
            username: 'portrait_artist',
            email: 'artist@example.com',
            followers_count: 300,
            following_count: 400,
            posts_count: 20,
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80'
        }
    }
];
