import { create } from 'zustand';
import api from '../services/api';

interface WishlistItem {
    _id: string;
    user: string;
    auction: {
        _id: string;
        title: string;
        images: string[];
        currentBid: number;
        basePrice: number;
        endTime: string;
        status: string;
        seller: {
            name: string;
            sellerRating?: number;
        };
    };
    addedAt: string;
}

interface WishlistState {
    wishlist: WishlistItem[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchWishlist: () => Promise<void>;
    addToWishlist: (auctionId: string) => Promise<void>;
    removeFromWishlist: (auctionId: string) => Promise<void>;
    checkWishlistStatus: (auctionId: string) => Promise<boolean>;
    toggleWishlist: (auctionId: string) => Promise<void>;
    clearError: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    isLoading: false,
    error: null,

    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/wishlist');
            set({
                wishlist: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch wishlist'
            });
        }
    },

    addToWishlist: async (auctionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/wishlist', { auctionId });
            const newItem = response.data.data;

            set((state) => ({
                wishlist: [newItem, ...state.wishlist],
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to add to wishlist'
            });
            throw error;
        }
    },

    removeFromWishlist: async (auctionId: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/wishlist/${auctionId}`);

            set((state) => ({
                wishlist: state.wishlist.filter(item => item.auction._id !== auctionId),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to remove from wishlist'
            });
            throw error;
        }
    },

    checkWishlistStatus: async (auctionId: string) => {
        try {
            const response = await api.get(`/wishlist/check/${auctionId}`);
            return response.data.inWishlist;
        } catch (error) {
            return false;
        }
    },

    toggleWishlist: async (auctionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/wishlist/toggle/${auctionId}`);
            const { action } = response.data;

            if (action === 'added') {
                // Item was added, fetch the updated wishlist
                await get().fetchWishlist();
            } else if (action === 'removed') {
                // Item was removed, update local state
                set((state) => ({
                    wishlist: state.wishlist.filter(item => item.auction._id !== auctionId),
                    isLoading: false
                }));
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to toggle wishlist'
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));