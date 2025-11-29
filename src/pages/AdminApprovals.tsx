import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

interface Auction {
    _id: string;
    title: string;
    seller: { name: string; _id: string };
    status: string;
    isApproved: boolean;
    createdAt: string;
    images?: string[];
    description?: string;
    basePrice?: number;
}

const AdminApprovals: React.FC = () => {
    const { user } = useAuthStore();
    const [pendingAuctions, setPendingAuctions] = useState<Auction[]>([]);
    const [, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchPendingAuctions();
        }
    }, [user]);

    const fetchPendingAuctions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-auctions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPendingAuctions(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending auctions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveAuction = async (auctionId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auctions/${auctionId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                alert('Auction approved successfully');
                fetchPendingAuctions(); // Refresh data
            } else {
                alert(data.message || 'Failed to approve auction');
            }
        } catch (error) {
            console.error('Error approving auction:', error);
            alert('Failed to approve auction');
        }
    };

    const handleRejectAuction = async (_id: string) => {
        if (window.confirm('Are you sure you want to reject this auction?')) {
            try {
                // For now, we'll just remove it from pending. In a real app, you'd have a reject endpoint
                alert('Auction rejected. This functionality would need a backend reject endpoint.');
                fetchPendingAuctions();
            } catch (error) {
                console.error('Error rejecting auction:', error);
                alert('Failed to reject auction');
            }
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-6xl mx-auto py-4">
                    <h1 className="text-2xl font-bold" style={{ color: '#1A73E8' }}>Auction Approvals</h1>
                    <p className="mt-1 text-gray-600">Review and approve auction listings</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto py-6">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Pending Auction Approvals
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Review auction details and approve listings for public visibility
                        </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {pendingAuctions.length > 0 ? pendingAuctions.map((auction) => (
                            <li key={auction._id} className="px-4 py-6 sm:px-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        {auction.images && auction.images[0] && (
                                            <div className="shrink-0">
                                                <img
                                                    className="h-20 w-20 rounded-lg object-cover"
                                                    src={auction.images[0]}
                                                    alt={auction.title}
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {auction.title}
                                                </h4>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending Approval
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Seller: <span className="font-medium">{auction.seller?.name || 'Unknown'}</span>
                                            </p>
                                            {auction.description && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {auction.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 mt-2">
                                                {auction.basePrice && (
                                                    <p className="text-sm text-gray-500">
                                                        Base Price: <span className="font-medium">₹{auction.basePrice.toLocaleString()}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    Submitted: {new Date(auction.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleApproveAuction(auction._id)}
                                            className="bg-[#1A73E8] text-white px-4 py-2 rounded text-sm hover:bg-[#1557B0] transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectAuction(auction._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </li>
                        )) : (
                            <li className="px-4 py-8 sm:px-6 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <i className="pi pi-check text-green-600 text-2xl"></i>
                                    </div>
                                    <p className="text-lg font-medium">All auctions approved!</p>
                                    <p className="text-sm">No pending approvals at the moment.</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminApprovals;