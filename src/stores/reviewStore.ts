import { create } from 'zustand';
import api from '../services/api';

interface Review {
    _id: string;
    reviewer: {
        _id: string;
        name: string;
        avatar?: string;
    };
    reviewee: string;
    auction: {
        _id: string;
        title: string;
    };
    rating: number;
    title: string;
    comment: string;
    isVerified: boolean;
    helpful: number;
    createdAt: string;
}

interface ReviewState {
    reviews: Review[];
    userReviews: Review[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchReviewsForUser: (userId: string) => Promise<void>;
    createReview: (reviewData: {
        auctionId: string;
        rating: number;
        title: string;
        comment: string;
    }) => Promise<void>;
    updateReview: (reviewId: string, reviewData: Partial<Review>) => Promise<void>;
    deleteReview: (reviewId: string) => Promise<void>;
    markHelpful: (reviewId: string) => Promise<void>;
    clearError: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
    reviews: [],
    userReviews: [],
    isLoading: false,
    error: null,

    fetchReviewsForUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/reviews/user/${userId}`);
            set({
                userReviews: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch reviews'
            });
        }
    },

    createReview: async (reviewData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/reviews', reviewData);
            const newReview = response.data.data;

            set((state) => ({
                userReviews: [newReview, ...state.userReviews],
                isLoading: false
            }));

            return newReview;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to create review'
            });
            throw error;
        }
    },

    updateReview: async (reviewId: string, reviewData: Partial<Review>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/reviews/${reviewId}`, reviewData);
            const updatedReview = response.data.data;

            set((state) => ({
                userReviews: state.userReviews.map(review =>
                    review._id === reviewId ? updatedReview : review
                ),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update review'
            });
            throw error;
        }
    },

    deleteReview: async (reviewId: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/reviews/${reviewId}`);

            set((state) => ({
                userReviews: state.userReviews.filter(review => review._id !== reviewId),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to delete review'
            });
            throw error;
        }
    },

    markHelpful: async (reviewId: string) => {
        try {
            const response = await api.put(`/reviews/${reviewId}/helpful`);

            set((state) => ({
                userReviews: state.userReviews.map(review =>
                    review._id === reviewId
                        ? { ...review, helpful: response.data.data.helpful }
                        : review
                )
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to mark review as helpful'
            });
        }
    },

    clearError: () => set({ error: null })
}));