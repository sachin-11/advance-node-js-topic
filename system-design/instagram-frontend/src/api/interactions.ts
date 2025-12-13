import { client } from './client';

export const likePost = async (postId: number) => {
    const response = await client.post<{ message: string }>(`/posts/${postId}/like`);
    return response.data;
};

export const unlikePost = async (postId: number) => {
    const response = await client.delete<{ message: string }>(`/posts/${postId}/like`);
    return response.data;
};

export const getComments = async (postId: number) => {
    const response = await client.get<any[]>(`/posts/${postId}/comments`);
    return response.data;
};

export const addComment = async (postId: number, content: string) => {
    const response = await client.post<any>(`/posts/${postId}/comments`, { content });
    return response.data;
};
