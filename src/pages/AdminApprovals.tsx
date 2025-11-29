import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

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
    category?: string;
    endTime?: string;
    startingBid?: number;
}

interface DetailedAuction extends Auction {
    winner?: { name: string; _id: string };
    currentBid?: number;
    bids?: any[];
    paymentStatus?: string;
    updatedAt?: string;
}

const AdminApprovals: React.FC = () => {
    const { user } = useAuthStore();
    const [pendingAuctions, setPendingAuctions] = useState<Auction[]>([]);
    const [, setIsLoading] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState<DetailedAuction | null>(null);
    const [auctionDetailsVisible, setAuctionDetailsVisible] = useState(false);
    const [, setAuctionDetailsLoading] = useState(false);

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

    const handleViewAuctionDetails = async (auctionId: string) => {
        setAuctionDetailsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auctions/${auctionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setSelectedAuction(data.data);
                setAuctionDetailsVisible(true);
            } else {
                alert('Failed to fetch auction details');
            }
        } catch (error) {
            console.error('Error fetching auction details:', error);
            alert('Failed to fetch auction details');
        } finally {
            setAuctionDetailsLoading(false);
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
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    {auction.basePrice && (
                                                        <p className="text-sm text-gray-500">
                                                            Base Price: <span className="font-medium">₹{auction.basePrice.toLocaleString()}</span>
                                                        </p>
                                                    )}
                                                    {auction.startingBid && auction.startingBid !== auction.basePrice && (
                                                        <p className="text-sm text-gray-500">
                                                            Starting Bid: <span className="font-medium">₹{auction.startingBid.toLocaleString()}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    {auction.category && (
                                                        <p className="text-sm text-gray-500">
                                                            Category: <span className="font-medium">{auction.category}</span>
                                                        </p>
                                                    )}
                                                    {auction.endTime && (
                                                        <p className="text-sm text-gray-500">
                                                            End Time: <span className="font-medium">{new Date(auction.endTime).toLocaleString()}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Submitted: {new Date(auction.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            severity='success'

                                            onClick={() => handleViewAuctionDetails(auction._id)}
                                            className="px-4 py-2 rounded text-sm transition-colors text-center"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => handleApproveAuction(auction._id)}
                                            className="px-4 py-2 rounded text-sm transition-colors text-center"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            severity='danger'
                                            onClick={() => handleRejectAuction(auction._id)}
                                            className="px-4 py-2 rounded text-sm transition-colors text-center"
                                        >
                                            Reject
                                        </Button>
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

            {/* Auction Details Modal */}
            <Dialog
                header="Auction Details"
                visible={auctionDetailsVisible}
                onHide={() => setAuctionDetailsVisible(false)}
                style={{ width: '60vw' }}
                className="p-fluid"
            >
                {selectedAuction && (
                    <div className="space-y-6">
                        {/* Auction Images */}
                        {selectedAuction.images && selectedAuction.images.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg mb-3">Auction Images</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedAuction.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Auction image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Auction Title and Description */}
                        <div>
                            <h3 className="text-2xl font-bold text-[#1A73E8] mb-2">{selectedAuction.title}</h3>
                            {selectedAuction.description && (
                                <p className="text-gray-600 mb-4">{selectedAuction.description}</p>
                            )}
                        </div>

                        {/* Auction Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Auction Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Category:</span> {selectedAuction.category || 'Not specified'}</p>
                                    <p><span className="font-medium">Status:</span>
                                        <Tag
                                            value={selectedAuction.status}
                                            severity={
                                                selectedAuction.status === 'active' ? 'success' :
                                                    selectedAuction.status === 'pending' ? 'warning' :
                                                        selectedAuction.status === 'completed' ? 'info' : 'danger'
                                            }
                                            className="ml-2"
                                        />
                                    </p>
                                    <p><span className="font-medium">Approval Status:</span>
                                        <Tag
                                            value={selectedAuction.isApproved ? 'Approved' : 'Pending'}
                                            severity={selectedAuction.isApproved ? 'success' : 'warning'}
                                            className="ml-2"
                                        />
                                    </p>
                                    <p><span className="font-medium">Created:</span> {new Date(selectedAuction.createdAt).toLocaleDateString()}</p>
                                    {selectedAuction.updatedAt && (
                                        <p><span className="font-medium">Last Updated:</span> {new Date(selectedAuction.updatedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Pricing & Timing</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Base Price:</span> ₹{selectedAuction.basePrice?.toLocaleString() || 'Not set'}</p>
                                    {selectedAuction.startingBid && selectedAuction.startingBid !== selectedAuction.basePrice && (
                                        <p><span className="font-medium">Starting Bid:</span> ₹{selectedAuction.startingBid.toLocaleString()}</p>
                                    )}
                                    {selectedAuction.currentBid && (
                                        <p><span className="font-medium">Current Bid:</span> ₹{selectedAuction.currentBid.toLocaleString()}</p>
                                    )}
                                    {selectedAuction.endTime && (
                                        <p><span className="font-medium">End Time:</span> {new Date(selectedAuction.endTime).toLocaleString()}</p>
                                    )}
                                </div>

                                <h4 className="font-semibold text-lg mt-6">Seller Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {selectedAuction.seller?.name || 'Unknown'}</p>
                                    <p><span className="font-medium">ID:</span> {selectedAuction.seller?._id || 'Unknown'}</p>
                                </div>

                                {selectedAuction.winner && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-lg">Winner Information</h4>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Name:</span> {selectedAuction.winner.name}</p>
                                            <p><span className="font-medium">ID:</span> {selectedAuction.winner._id}</p>
                                            {selectedAuction.paymentStatus && (
                                                <p><span className="font-medium">Payment Status:</span>
                                                    <Tag
                                                        value={selectedAuction.paymentStatus}
                                                        severity={
                                                            selectedAuction.paymentStatus === 'paid' ? 'success' :
                                                                selectedAuction.paymentStatus === 'pending' ? 'warning' : 'danger'
                                                        }
                                                        className="ml-2"
                                                    />
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bids Information */}
                        {selectedAuction.bids && selectedAuction.bids.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-lg mb-3">Bid History</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Bids: {selectedAuction.bids.length}</p>
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        {selectedAuction.bids.slice(-5).map((bid: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                                <span className="text-sm">{bid.bidder?.name || 'Unknown User'}</span>
                                                <span className="text-sm font-medium">₹{bid.amount?.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default AdminApprovals;