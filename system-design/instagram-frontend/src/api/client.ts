import axios from 'axios';

// Create API client with default config
export const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add response interceptor for global error handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g., logout)
        if (error.response?.status === 401) {
            // Clear local storage or redirect to login could happen here
            // But we will let the individual calls handle it via Context for now
        }
        return Promise.reject(error);
    }
);

// Helper to set auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
};
