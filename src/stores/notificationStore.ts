import { create } from 'zustand';
import api from '../services/api';

interface Notification {
    _id: string;
    user: string;
    type: 'bid_received' | 'outbid' | 'auction_won' | 'auction_lost' | 'auction_ending_soon' | 'auction_approved' | 'auction_rejected' | 'payment_required' | 'payment_successful' | 'review_received' | 'aadhaar_uploaded' | 'aadhaar_verified' | 'aadhaar_rejected';
    title: string;
    message: string;
    auction?: string;
    bid?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/notifications');
            const notifications = response.data.data;
            const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

            set({
                notifications,
                unreadCount,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch notifications'
            });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);

            set((state) => ({
                notifications: state.notifications.map(notification =>
                    notification._id === id
                        ? { ...notification, isRead: true }
                        : notification
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to mark notification as read'
            });
        }
    },

    markAllAsRead: async () => {
        set({ isLoading: true, error: null });
        try {
            await api.put('/notifications/read-all');

            set((state) => ({
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    isRead: true
                })),
                unreadCount: 0,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to mark all notifications as read'
            });
        }
    },

    clearError: () => set({ error: null })
}));