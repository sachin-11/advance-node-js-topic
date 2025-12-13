import { client } from './client';
import { Post } from '../types';

export const getFeed = async (page = 1, limit = 10) => {
    const response = await client.get<{ posts: Post[], pagination: any }>(`/feed?page=${page}&limit=${limit}`);
    return response.data.posts;
};

export const createPost = async (formData: FormData) => {
    const response = await client.post<Post>('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getUserPosts = async (userId: number) => {
    const response = await client.get<{ posts: Post[], pagination: any }>(`/posts/users/${userId}/posts`);
    return response.data.posts;
};
