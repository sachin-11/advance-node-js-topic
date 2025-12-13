import { client } from './client';
import { AuthResponse } from '../types';

export const login = async (data: any) => {
    const response = await client.post<AuthResponse>('/auth/login', data);
    return response.data;
};

export const register = async (data: any) => {
    const response = await client.post<AuthResponse>('/auth/register', data);
    return response.data;
};
