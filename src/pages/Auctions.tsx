import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuctionStore } from '../stores/auctionStore';
import { Card } from 'primereact/card';
import { DataView } from 'primereact/dataview';
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

    const itemTemplate = (auction: any) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-2 auctionCard">
            <Card className="shadow-modern h-full rounded-2xl" style={{ border: '1px solid #cecece', borderRadius: '16px' }}>
                <div className="relative">
                    {auction.images && auction.images[0] ? (
                        <img
                            src={auction.images[0]}
                            alt={auction.title}
                            className="w-full h-12rem object-cover rounded-xl"
                        />
                    ) : (
                        <div className="w-full h-12rem bg-gray-200 flex align-items-center justify-content-center border-round-top">
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
                <div className="p-1 pt-3 text-start">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">{auction.title}</h3>
                    <p className="text-sm text-600 mb-2 line-clamp-2">{auction.description}</p>
                    <div className="flex justify-content-between align-items-center mb-2">
                        <span className="text-sm text-500">Current Bid:</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(auction.currentBid || auction.basePrice)}</span>
                    </div>
                    <div className="flex justify-content-between align-items-center mb-3">
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
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 auctionCard mt-4">
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

                {/* Auctions Grid */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <ProgressSpinner />
                        <p className="mt-4 text-600">Loading auctions...</p>
                    </div>
                ) : (
                    <div>
                        <DataView
                            value={auctions}
                            itemTemplate={itemTemplate}
                            layout="grid"
                            paginator
                            rows={12}
                            className='text-center mt-4 rounded-2xl'
                            emptyMessage="No auctions found matching your criteria."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auctions;