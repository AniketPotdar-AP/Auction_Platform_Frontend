import { create } from 'zustand';
import api from '../services/api';

interface Bid {
    _id: string;
    auction: string;
    bidder: {
        _id: string;
        name: string;
        avatar?: string;
    };
    amount: number;
    timestamp: string;
    isWinning: boolean;
    isOutbid: boolean;
}

interface BidState {
    bids: Bid[];
    myBids: Bid[];
    activeBids: Bid[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBidsForAuction: (auctionId: string) => Promise<void>;
    fetchMyBids: () => Promise<void>;
    placeBid: (auctionId: string, amount: number) => Promise<void>;
    clearError: () => void;
}

export const useBidStore = create<BidState>((set, get) => ({
    bids: [],
    myBids: [],
    activeBids: [],
    isLoading: false,
    error: null,

    fetchBidsForAuction: async (auctionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/bids/auction/${auctionId}`);
            set({
                bids: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch bids'
            });
        }
    },

    fetchMyBids: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/bids/my-bids');
            set({
                myBids: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch my bids'
            });
        }
    },

    placeBid: async (auctionId: string, amount: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/bids', { auctionId, amount });
            const newBid = response.data.data;

            // Update bids list
            set((state) => ({
                bids: [newBid, ...state.bids],
                myBids: [newBid, ...state.myBids],
                isLoading: false
            }));

            return newBid;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to place bid'
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));