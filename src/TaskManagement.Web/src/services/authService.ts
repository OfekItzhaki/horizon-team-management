import axios from 'axios';
import { LoginDto, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const authService = {
    login: async (credentials: LoginDto): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: (): AuthResponse | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },
};
