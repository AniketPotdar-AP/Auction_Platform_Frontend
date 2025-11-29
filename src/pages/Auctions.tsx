import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuctionStore } from '../stores/auctionStore';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import CustomInput from '../components/CustomInput';
import CustomSelect from '../components/CustomSelect';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Auctions: React.FC = () => {
    const { user } = useAuthStore();
    const { auctions, fetchAuctions, isLoading } = useAuctionStore();
    const [filters, setFilters] = useState({
        category: '',
        status: 'active',
        search: '',
        sort: '-createdAt'
    });

    useEffect(() => {
        fetchAuctions(filters);
    }, [fetchAuctions, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getTimeRemaining = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const statusOptions = [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' }
    ];

    const categoryOptions = [
        { label: 'All Categories', value: '' },
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Clothing', value: 'Clothing' },
        { label: 'Vehicles', value: 'Vehicles' },
        { label: 'Art', value: 'Art' },
        { label: 'Collectibles', value: 'Collectibles' }
    ];

    const sortOptions = [
        { label: 'Newest', value: '-createdAt' },
        { label: 'Oldest', value: 'createdAt' },
        { label: 'Highest Bid', value: '-currentBid' },
        { label: 'Lowest Bid', value: 'currentBid' },
        { label: 'Ending Soon', value: 'endTime' }
    ];


    return (
        <div className="min-h-screen bg-gray-50 p-4 mt-4">
            <div className="max-w-8xl mx-auto">
                {/* Header */}

                <div className="flex justify-content-between align-items-center mb-4">
                    <h1 className="text-2xl font-bold">Auctions</h1>
                    {user?.role === 'user' && (
                        <Link to="/create-auction">
                            <Button className="p-button-primary flex gap-2" >
                                <Plus size={20} />
                                Create Auction
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className='auctionCard'>
                    <Card className="shadow-modern mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-fluid">
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <CustomSelect
                                    value={filters.status}
                                    options={statusOptions}
                                    onChange={(e) => handleFilterChange('status', e.value)}
                                    placeholder="Select status"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <CustomSelect
                                    value={filters.category}
                                    options={categoryOptions}
                                    onChange={(e) => handleFilterChange('category', e.value)}
                                    placeholder="Select category"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Sort By</label>
                                <CustomSelect
                                    value={filters.sort}
                                    options={sortOptions}
                                    onChange={(e) => handleFilterChange('sort', e.value)}
                                    placeholder="Select sort"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <CustomInput
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search auctions..."
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Auctions Grid */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <ProgressSpinner />
                        <p className="mt-4 text-600">Loading auctions...</p>
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-600">No auctions found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="mt-6 ">
                        {/* Custom Grid Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
                            {auctions.slice(0, 12).map((auction: any) => (
                                <Card key={auction._id} className="shadow-modern h-full rounded-2xl hover:scale-101 duration-150" style={{ border: '1px solid #cecece', borderRadius: '16px' }}>
                                    <div className="relative">
                                        {auction.images && auction.images[0] ? (
                                            <img
                                                src={auction.images[0]}
                                                alt={auction.title}
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex align-items-center justify-content-center rounded-xl">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 mt-2 mr-2">
                                            <Tag
                                                value={auction.status}
                                                className='capitalize'
                                                severity={
                                                    auction.status === 'active' ? 'success' :
                                                        auction.status === 'completed' ? 'info' : 'warning'
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="py-4 text-start">
                                        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{auction.title}</h3>
                                        <p className="text-sm text-600 mb-3 line-clamp-2">{auction.description}</p>
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <span className="text-sm text-500">Current Bid:</span>
                                            <span className="text-lg font-bold text-green-600">{formatCurrency(auction.currentBid || auction.basePrice)}</span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <span className="text-sm text-500">Category:</span>
                                            <span className={`text-sm font-medium`}>
                                                {auction.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center mb-4">
                                            <span className="text-sm text-500">Time Left:</span>
                                            <span className={`text-sm font-medium ${getTimeRemaining(auction.endTime) === 'Ended' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {getTimeRemaining(auction.endTime)}
                                            </span>
                                        </div>
                                        <Link to={`/auctions/${auction._id}`}>
                                            <Button label="View Details" className="w-full p-button-primary" />
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Simple Pagination */}
                        {auctions.length > 12 && (
                            <div className="text-center">
                                <p className="text-sm text-600 mb-4">Showing 12 of {auctions.length} auctions</p>
                                <p className="text-xs text-500">Load more functionality can be added here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auctions;