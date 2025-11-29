import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../stores/auctionStore';
import { useBidStore } from '../stores/bidStore';
import { useAuthStore } from '../stores/authStore';
import { useReviewStore } from '../stores/reviewStore';
import { useWishlistStore } from '../stores/wishlistStore';
import io, { Socket } from 'socket.io-client';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import CustomInput from '../components/CustomInput';

const AuctionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const { currentAuction, fetchAuctionById } = useAuctionStore();
    const { bids, fetchBidsForAuction, placeBid, updateBid, isLoading: bidLoading } = useBidStore();
    const { createReview } = useReviewStore();
    const { toggleWishlist, checkWishlistStatus } = useWishlistStore();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [, setActiveUsers] = useState(0);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAuctionById(id);
            fetchBidsForAuction(id);
        }
    }, [id, fetchAuctionById, fetchBidsForAuction]);

    useEffect(() => {
        if (id && user) {
            checkWishlistStatus(id).then(setIsInWishlist);
        }
    }, [id, user, checkWishlistStatus]);

    useEffect(() => {
        if (!id || !user) return;

        // Connect to Socket.IO
        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
        setSocket(newSocket);

        // Join auction room
        newSocket.emit('joinAuction', id);

        // Listen for events
        newSocket.on('auctionJoined', (data) => {
            setActiveUsers(data.activeUsers);
        });

        newSocket.on('userJoined', (data) => {
            setActiveUsers(data.activeUsers);
        });

        newSocket.on('userLeft', (data) => {
            setActiveUsers(data.activeUsers);
        });

        newSocket.on('newBid', () => {
            // Update bids list
            fetchBidsForAuction(id);
            // Update current auction
            fetchAuctionById(id);
        });

        newSocket.on('auctionEnded', () => {
            fetchAuctionById(id);
        });

        return () => {
            newSocket.emit('leaveAuction', id);
            newSocket.disconnect();
        };
    }, [id, user]);

    useEffect(() => {
        if (!currentAuction) return;

        const updateTimeLeft = () => {
            const now = new Date();
            const end = new Date(currentAuction.endTime);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Auction Ended');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${seconds}s`);
            }
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [currentAuction]);

    const handlePlaceBid = async () => {
        if (!id || !bidAmount || !currentAuction) return;

        const amount = parseInt(bidAmount);
        // Bid must always be greater than or equal to minimum auction amount
        if (amount < currentAuction.minAuctionAmount) {
            setError(`Bid amount must be at least the minimum auction amount of ₹${currentAuction.minAuctionAmount}`);
            return;
        }

        if (currentAuction.seller && currentAuction.seller._id === user?._id) {
            setError('You cannot bid on your own auction');
            return;
        }

        try {
            setError('');
            if (hasUserBid && userExistingBid) {
                await updateBid(userExistingBid._id, amount);
            } else {
                await placeBid(id, amount);

                if (socket) {
                    socket.emit('bidPlaced', {
                        auctionId: id,
                        bidData: {
                            amount,
                            bidder: {
                                _id: user?._id,
                                name: user?.name
                            }
                        }
                    });
                }
            }

            setBidAmount('');
        } catch (error: any) {
            setError(error.message || `Failed to ${hasUserBid ? 'update' : 'place'} bid`);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            await createReview({
                auctionId: id,
                rating: reviewData.rating,
                title: reviewData.title,
                comment: reviewData.comment
            });

            setShowReviewForm(false);
            setReviewData({ rating: 5, title: '', comment: '' });
        } catch (error: any) {
            setError(error.message || 'Failed to submit review');
        }
    };

    const handleWishlistToggle = async () => {
        if (!id || wishlistLoading) return;

        setWishlistLoading(true);
        try {
            await toggleWishlist(id);
            setIsInWishlist(!isInWishlist);
        } catch (error) {
            console.error('Wishlist toggle error:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (!currentAuction) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
            </div>
        );
    }

    const isAuctionActive = currentAuction.status === 'active' && new Date() < new Date(currentAuction.endTime);
    const canBid = isAuthenticated && user && currentAuction.seller && user._id !== currentAuction.seller._id && isAuctionActive;
    const currentBid = currentAuction.currentBid || currentAuction.basePrice;
    const minNextBid = currentAuction.minAuctionAmount;

    // Check if user has already placed a bid
    const userExistingBid = bids.find(bid => bid.bidder._id === user?._id);
    const hasUserBid = !!userExistingBid;


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="shadow cursor-pointer">
                <div className="max-w-6xl mx-auto py-4">
                    <button
                        onClick={() => navigate('/auctions')}
                        className="font-medium cursor-pointer flex gap-1"
                    >
                        <span className="mr-2">←</span>
                        Back to Auctions
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-6 xl:px-0 px-4">
                {/* Top Section: Image and Bidding Panel Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Image Section */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        {currentAuction.images && currentAuction.images[0] ? (
                            <img
                                src={currentAuction.images[0]}
                                alt={currentAuction.title}
                                className="w-full h-96 object-cover"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-lg">No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Bidding Panel */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {formatCurrency(currentBid)}
                            </div>
                            <div className="text-sm text-gray-500 mb-6">Current Highest Bid</div>
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {formatCurrency(currentAuction.minAuctionAmount)}
                            </div>
                            <div className="text-sm text-gray-500 mb-6">Min. Starting Bid</div>
                            <div>
                                {timeLeft === 'Auction Ended' ? (
                                    <div className="flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                        <span className="text-2xl">⏰</span>
                                        <span className="text-lg font-bold text-red-600">Auction Ended</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                        <span className="text-2xl">⏳</span>
                                        <span className="text-lg font-bold text-blue-600">{timeLeft}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Auction Details (Full Width) */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{currentAuction.title}</h1>
                        {isAuthenticated && user && currentAuction.seller && user._id !== currentAuction.seller._id && (
                            <Button
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                label={wishlistLoading ? '...' : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
                                icon={isInWishlist ? 'pi pi-heart-fill' : 'pi pi-heart'}
                                className={isInWishlist ? 'p-button-danger p-button-outlined' : 'p-button-secondary p-button-outlined'}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ml-0 mr-0">
                        <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium">{currentAuction.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Condition</p>
                            <p className="font-medium">{currentAuction.condition}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Seller</p>
                            <p className="font-medium">{currentAuction.seller?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Base Price</p>
                            <p className="font-medium">{formatCurrency(currentAuction.basePrice)}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{currentAuction.description}</p>
                    </div>
                </div>

                {/* Bottom Section: Bid History Table with Bidding */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-6">Bid History & Place Your Bid</h3>

                    {/* Quick Bid Section for authenticated users */}
                    {canBid && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="text-lg font-medium text-blue-900 mb-3">Quick Bid</h4>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-blue-800 mb-2">
                                        Your Bid Amount
                                    </label>
                                    <InputNumber
                                        value={bidAmount ? parseInt(bidAmount) : (hasUserBid && userExistingBid ? userExistingBid.amount : 0)}
                                        onValueChange={(e) => setBidAmount(e.value?.toString() || '')}
                                        min={minNextBid}
                                        step={1}
                                        mode="currency"
                                        currency="INR"
                                        locale="en-IN"
                                        placeholder={hasUserBid ? `Your current bid: ₹${userExistingBid?.amount}` : `Minimum: ₹${minNextBid}`}
                                        className="w-full"
                                        useGrouping={false}
                                        minFractionDigits={0}
                                        maxFractionDigits={0}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                                <Button
                                    onClick={handlePlaceBid}
                                    disabled={bidLoading || !bidAmount}
                                    label={bidLoading ? (hasUserBid ? 'Updating...' : 'Placing...') : (hasUserBid ? 'Update Bid' : 'Place Bid')}
                                    loading={bidLoading}
                                    className="p-button-primary px-6"
                                />
                            </div>
                            {error && (
                                <div className="text-red-600 text-sm mt-2">{error}</div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Bid History Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                <span className="mr-2">📊</span>
                                Bid History ({bids.length} bids)
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">Track all bids placed on this auction</p>
                        </div>

                        <div className="overflow-x-auto">
                            {bids.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bidder</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bid Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {bids
                                            .sort((a, b) => b.amount - a.amount) // Sort by amount descending (highest first)
                                            .map((bid, index) => {
                                                const isUserBid = bid.bidder._id === user?._id;
                                                return (
                                                    <tr key={bid._id} className={`hover:bg-gray-50 transition-colors ${bid.isWinning ? 'bg-green-50' :
                                                        isUserBid ? 'bg-blue-50' : ''
                                                        }`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${bid.isWinning
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : isUserBid
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900"> {bid.bidder._id === user?._id ? bid.bidder.name : 'User ' + bid.bidder._id}</div>
                                                            {bid.bidder._id === user?._id && (
                                                                <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                    You
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-lg font-bold text-green-600">{formatCurrency(bid.amount)}</div>
                                                            {index < bids.length - 1 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{formatCurrency(bid.amount - bids[bids.length - 1 - index].amount)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(bid.timestamp).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(bid.timestamp).toLocaleTimeString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {bid.isWinning ? (
                                                                <div className="flex flex-col items-start">
                                                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 mb-1">
                                                                        🏆 Winning Bid
                                                                    </span>
                                                                    {currentAuction.status === 'completed' && (
                                                                        <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                                                            Auction Ended
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                                                                    ❌ Outbid
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-3xl">💰</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
                                    <p className="text-gray-500 mb-4">Be the first to place a bid on this auction!</p>
                                    {canBid && (
                                        <div className="text-sm text-blue-600 font-medium">
                                            Minimum bid: {formatCurrency(minNextBid)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {bids.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-gray-600">
                                        <span className="font-medium">{bids.length}</span> total bids
                                    </div>
                                    <div className="text-gray-600">
                                        Highest bid: <span className="font-semibold text-green-600">{formatCurrency(Math.max(...bids.map(b => b.amount)))}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                {currentAuction.status === 'completed' && currentAuction.winner && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Reviews & Ratings</h3>

                        {/* Review Form for Winner */}
                        {currentAuction.winner._id === user?._id && currentAuction.paymentStatus === 'paid' && (
                            <div className="mb-6">
                                {!showReviewForm ? (
                                    <Button
                                        onClick={() => setShowReviewForm(true)}
                                        label="Write a Review"
                                        icon="pi pi-pencil"
                                        className="p-button-primary"
                                    />
                                ) : (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div className="field">
                                            <label className="block text-sm font-medium mb-2">
                                                Rating
                                            </label>
                                            <Rating
                                                value={reviewData.rating}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, rating: e.value || 5 }))}
                                                stars={5}
                                                cancel={false}
                                            />
                                        </div>

                                        <div className="field">
                                            <label className="block text-sm font-medium mb-2">
                                                Review Title
                                            </label>
                                            <CustomInput
                                                type="text"
                                                value={reviewData.title}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Summarize your experience"
                                                required
                                            />
                                        </div>

                                        <div className="field">
                                            <label className="block text-sm font-medium mb-2">
                                                Review Comment
                                            </label>
                                            <InputTextarea
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                                rows={4}
                                                placeholder="Share your experience with this seller"
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                label="Submit Review"
                                                icon="pi pi-send"
                                                className="p-button-success"
                                            />
                                            <Button
                                                type="button"
                                                label="Cancel"
                                                icon="pi pi-times"
                                                className="p-button-secondary"
                                                onClick={() => setShowReviewForm(false)}
                                            />
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Display Reviews */}
                        <div className="space-y-4">
                            {/* Placeholder for reviews - in a real app, you'd fetch and display them */}
                            <p className="text-gray-500 text-center py-4">No reviews yet</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionDetail;