import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    userType: string;
    permissions: {
        canBid: boolean;
        canCreateAuction: boolean;
    };
    avatar?: string;
    phone?: string;
    address?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    sellerRating?: number;
    totalReviews?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        name: string;
        email: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/users/login', { email, password });
                    const { user, token } = response.data.data;

                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Login failed'
                    });
                    throw error;
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/users/register', userData);
                    const { user, token } = response.data.data;

                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Registration failed'
                    });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            loadUser: async () => {
                const token = localStorage.getItem('token');
                if (!token) return;

                set({ isLoading: true });
                try {
                    const response = await api.get('/users/me');
                    set({
                        user: response.data.data,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                }
            },

            updateProfile: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.put('/users/profile', userData);
                    set((state) => ({
                        user: { ...state.user!, ...response.data.data },
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Update failed'
                    });
                    throw error;
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);