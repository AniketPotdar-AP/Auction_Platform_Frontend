import { create } from 'zustand';
import api from '../services/api';

interface Auction {
    _id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    condition: string;
    images: string[];
    basePrice: number;
    currentBid: number;
    minAuctionAmount: number;
    startTime: string;
    endTime: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    seller: {
        _id: string;
        name: string;
        avatar?: string;
        sellerRating?: number;
    };
    winner?: {
        _id: string;
        name: string;
    };
    bids: any[];
    paymentStatus?: 'pending' | 'paid' | 'overdue';
    isApproved: boolean;
    views: number;
    createdAt: string;
}

interface AuctionState {
    auctions: Auction[];
    myAuctions: Auction[];
    wonAuctions: Auction[];
    currentAuction: Auction | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAuctions: (params?: any) => Promise<void>;
    fetchMyAuctions: () => Promise<void>;
    fetchWonAuctions: () => Promise<void>;
    fetchAuctionById: (id: string) => Promise<void>;
    createAuction: (auctionData: FormData) => Promise<void>;
    updateAuction: (id: string, auctionData: any) => Promise<void>;
    deleteAuction: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useAuctionStore = create<AuctionState>((set) => ({
    auctions: [],
    myAuctions: [],
    wonAuctions: [],
    currentAuction: null,
    isLoading: false,
    error: null,

    fetchAuctions: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/auctions', { params });
            set({
                auctions: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch auctions'
            });
        }
    },

    fetchMyAuctions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/auctions/myauctions');
            set({
                myAuctions: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch my auctions'
            });
        }
    },

    fetchWonAuctions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/auctions/won');
            set({
                wonAuctions: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch won auctions'
            });
        }
    },

    fetchAuctionById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/auctions/${id}`);
            set({
                currentAuction: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch auction'
            });
        }
    },

    createAuction: async (auctionData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            // Use a custom axios instance for FormData to avoid JSON Content-Type
            const response = await api.post('/auctions', auctionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newAuction = response.data.data;

            set((state) => ({
                myAuctions: [newAuction, ...state.myAuctions],
                isLoading: false
            }));

            return newAuction;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to create auction'
            });
            throw error;
        }
    },

    updateAuction: async (id: string, auctionData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/auctions/${id}`, auctionData);
            const updatedAuction = response.data.data;

            set((state) => ({
                myAuctions: state.myAuctions.map(auction =>
                    auction._id === id ? updatedAuction : auction
                ),
                currentAuction: state.currentAuction?._id === id ? updatedAuction : state.currentAuction,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update auction'
            });
            throw error;
        }
    },

    deleteAuction: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/auctions/${id}`);

            set((state) => ({
                myAuctions: state.myAuctions.filter(auction => auction._id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to delete auction'
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));