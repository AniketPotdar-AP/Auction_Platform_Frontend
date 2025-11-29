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
    const { user } = useAuthStore();
    const { currentAuction, fetchAuctionById } = useAuctionStore();
    const { bids, fetchBidsForAuction, placeBid, isLoading: bidLoading } = useBidStore();
    const { createReview } = useReviewStore();
    const { toggleWishlist, checkWishlistStatus } = useWishlistStore();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [activeUsers, setActiveUsers] = useState(0);
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

        const amount = parseFloat(bidAmount);
        const minBid = (currentAuction.currentBid || currentAuction.basePrice) + currentAuction.minIncrement;

        if (amount < minBid) {
            setError(`Minimum bid amount is ₹${minBid}`);
            return;
        }

        if (currentAuction.seller && currentAuction.seller._id === user?._id) {
            setError('You cannot bid on your own auction');
            return;
        }

        try {
            setError('');
            await placeBid(id, amount);
            setBidAmount('');

            // Emit bid event via socket
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
        } catch (error: any) {
            setError(error.message || 'Failed to place bid');
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isAuctionActive = currentAuction.status === 'active' && new Date() < new Date(currentAuction.endTime);
    const canBid = user && currentAuction.seller && user._id !== currentAuction.seller._id && isAuctionActive;
    const currentBid = currentAuction.currentBid || currentAuction.basePrice;
    const minNextBid = currentBid + currentAuction.minIncrement;

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

            <div className="max-w-6xl mx-auto py-6 ">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Images */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
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

                        {/* Auction Details */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{currentAuction.title}</h1>
                                {user && currentAuction.seller && user._id !== currentAuction.seller._id && (
                                    <Button
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistLoading}
                                        label={wishlistLoading ? '...' : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
                                        icon={isInWishlist ? 'pi pi-heart-fill' : 'pi pi-heart'}
                                        className={isInWishlist ? 'p-button-danger p-button-outlined' : 'p-button-secondary p-button-outlined'}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
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
                                    <p className="text-sm text-gray-500">Active Users</p>
                                    <p className="font-medium">{activeUsers}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">{currentAuction.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Bidding Panel */}
                        <div className="bg-white rounded-lg shadow-md p-4 py-6 mb-4">
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {formatCurrency(currentBid)}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">Current Bid</div>
                                <div className={`text-lg font-semibold ${timeLeft === 'Auction Ended' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {timeLeft}
                                </div>
                            </div>

                            {canBid && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Bid (Minimum: {formatCurrency(minNextBid)})
                                        </label>
                                        <InputNumber
                                            value={parseFloat(bidAmount) || 0}
                                            onValueChange={(e) => setBidAmount(e.value?.toString() || '')}
                                            min={minNextBid}
                                            step={currentAuction.minIncrement}
                                            mode="currency"
                                            currency="INR"
                                            locale="en-IN"
                                            placeholder={`Enter bid amount`}
                                            className="w-full"
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-red-600 text-sm">{error}</div>
                                    )}

                                    <Button
                                        onClick={handlePlaceBid}
                                        disabled={bidLoading || !bidAmount}
                                        label={bidLoading ? 'Placing Bid...' : 'Place Bid'}
                                        loading={bidLoading}
                                        className="w-full p-button-primary"
                                    />
                                </div>
                            )}

                            {!canBid && (
                                <div className="text-center text-gray-500">
                                    {currentAuction.seller && currentAuction.seller._id === user?._id
                                        ? 'You cannot bid on your own auction'
                                        : !isAuctionActive
                                            ? 'This auction has ended'
                                            : 'Please log in to bid'
                                    }
                                </div>
                            )}
                        </div>

                        {/* Bid History */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold mb-4 text-center">Bid History</h3>
                            {bids.length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {bids.slice(0, 10).map((bid) => (
                                        <div key={bid._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-sm">{bid.bidder.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(bid.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">
                                                    {formatCurrency(bid.amount)}
                                                </p>
                                                {bid.isWinning && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        Winning
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No bids yet</p>
                            )}
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
            </div>
        </div>
    );
};

export default AuctionDetail;