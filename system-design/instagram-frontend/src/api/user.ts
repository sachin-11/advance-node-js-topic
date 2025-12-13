import { client } from './client';
import { User } from '../types';

export const getProfile = async (id: number) => {
    const response = await client.get<User>(`/users/${id}`);
    return response.data;
};

export const updateProfile = async (id: number, data: Partial<User>) => {
    const response = await client.put<User>(`/users/${id}`, data);
    return response.data;
};
