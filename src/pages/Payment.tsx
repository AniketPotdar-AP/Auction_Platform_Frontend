import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../stores/auctionStore';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const Payment: React.FC = () => {
    const { auctionId } = useParams<{ auctionId: string }>();
    const navigate = useNavigate();
    const { currentAuction, fetchAuctionById } = useAuctionStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (auctionId) {
            fetchAuctionById(auctionId);
        }
    }, [auctionId, fetchAuctionById]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handlePayment = async () => {
        if (!currentAuction) return;

        setIsLoading(true);
        setError('');

        try {
            // Create Razorpay order
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    auctionId: currentAuction._id,
                    amount: currentAuction.currentBid
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: 'INR',
                name: 'Aucto',
                description: `Payment for auction: ${currentAuction.title}`,
                order_id: data.order.id,
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                auctionId: currentAuction._id
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            alert('Payment successful!');
                            navigate('/dashboard');
                        } else {
                            setError('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        setError('Payment verification failed');
                    }
                },
                prefill: {
                    name: '', // You can get this from user store
                    email: '', // You can get this from user store
                    contact: '' // You can get this from user store
                },
                theme: {
                    color: '#1A73E8'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error('Payment error:', error);
            setError(error.message || 'Failed to initiate payment');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentAuction) {
        return (
            <div className="min-h-screen bg-gray-50 flex align-items-center justify-content-center">
                <ProgressSpinner />
            </div>
        );
    }

    // Check if user is the winner
    const isWinner = currentAuction.winner?._id === localStorage.getItem('user')?.split('"')[3]; // This is a hack, should use proper user store

    if (!isWinner) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You are not authorized to make payment for this auction.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-[#1A73E8] px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
                        <p className="text-blue-100 mt-1">Secure payment for your won auction</p>
                    </div>

                    <div className="p-6">
                        {/* Auction Details */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Auction Details</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    {currentAuction.images && currentAuction.images[0] && (
                                        <img
                                            src={currentAuction.images[0]}
                                            alt={currentAuction.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{currentAuction.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{currentAuction.description}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Seller:</span>
                                            <span className="text-sm font-medium">{currentAuction.seller?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Winning Bid Amount</span>
                                        <span className="font-medium">{formatCurrency(currentAuction.currentBid)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee</span>
                                        <span className="font-medium">₹0.00</span>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">{formatCurrency(currentAuction.currentBid)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                                        <span className="text-white text-xs font-bold">RP</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Razorpay</p>
                                        <p className="text-sm text-gray-600">Secure payment gateway</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <Message severity="error" text={error} className="mb-6" />
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                label="Cancel"
                                className="flex-1 p-button-secondary"
                            />
                            <Button
                                onClick={handlePayment}
                                disabled={isLoading}
                                label={isLoading ? 'Processing...' : `Pay ${formatCurrency(currentAuction.currentBid)}`}
                                loading={isLoading}
                                className="flex-1 p-button-primary"
                            />
                        </div>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Your payment is secured by Razorpay. We do not store your payment information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;