import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuctionStore } from '../stores/auctionStore';
import { useBidStore } from '../stores/bidStore';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { ShoppingCart, Trophy, DollarSign, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { myAuctions, wonAuctions, fetchMyAuctions, fetchWonAuctions } = useAuctionStore();
    const { myBids, fetchMyBids } = useBidStore();

    const [activeUsers, setActiveUsers] = useState(0);
    const [, setUserStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        activeAuctions: 0,
        totalAuctions: 0
    });
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        fetchMyAuctions();
        fetchWonAuctions();
        fetchMyBids();
        if (user?.role === 'admin') {
            fetchDashboardStats();
        }
    }, [fetchMyAuctions, fetchWonAuctions, fetchMyBids, user?.role]);

    const fetchDashboardStats = async () => {
        try {
            // Fetch active users count
            const activeUsersResponse = await fetch(`${import.meta.env.VITE_API_URL}/auctions/active-users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (activeUsersResponse.ok) {
                const activeUsersData = await activeUsersResponse.json();
                setActiveUsers(activeUsersData.count || 0);
            }

            // Fetch user statistics for charts
            const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setUserStats(statsData);

                // Prepare chart data
                setChartData({
                    labels: ['Total Users', 'Verified Users', 'Active Auctions', 'Total Auctions'],
                    datasets: [{
                        label: 'Statistics',
                        data: [
                            statsData.totalUsers || 0,
                            statsData.verifiedUsers || 0,
                            statsData.activeAuctions || 0,
                            statsData.totalAuctions || 0
                        ],
                        backgroundColor: [
                            '#1A73E8',
                            '#FFB300',
                            '#4CAF50',
                            '#FF9800'
                        ],
                        borderColor: [
                            '#1557B0',
                            '#FF8F00',
                            '#388E3C',
                            '#F57C00'
                        ],
                        borderWidth: 1
                    }]
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const myAuctionsTemplate = (rowData: any) => (
        <div className="flex align-items-center">
            {rowData.images && rowData.images[0] && (
                <img
                    className="w-3rem h-3rem border-round mr-3"
                    src={rowData.images[0]}
                    alt={rowData.title}
                />
            )}
            <div>
                <div className="font-medium">{rowData.title}</div>
                <div className="text-sm text-500">
                    Current Bid: {formatCurrency(rowData.currentBid || rowData.basePrice)}
                </div>
            </div>
        </div>
    );

    const statusTemplate = (rowData: any) => (
        <Tag
            value={rowData.status}
            severity={
                rowData.status === 'active' ? 'success' :
                    rowData.status === 'completed' ? 'info' : 'warning'
            }
        />
    );

    const wonAuctionsTemplate = (rowData: any) => (
        <div className="flex align-items-center">
            {rowData.images && rowData.images[0] && (
                <img
                    className="w-3rem h-3rem border-round mr-3"
                    src={rowData.images[0]}
                    alt={rowData.title}
                />
            )}
            <div>
                <div className="font-medium">{rowData.title}</div>
                <div className="text-sm text-500">
                    Won for: {formatCurrency(rowData.currentBid)}
                </div>
            </div>
        </div>
    );

    const paymentTemplate = (rowData: any) => (
        <div className="flex align-items-center gap-2">
            <Tag
                value={rowData.paymentStatus === 'paid' ? 'Paid' : 'Payment Due'}
                severity={rowData.paymentStatus === 'paid' ? 'success' : 'warning'}
            />
            {rowData.paymentStatus !== 'paid' && (
                <Link to={`/payment/${rowData._id}`}>
                    <Button label="Pay Now" size="small" />
                </Link>
            )}
        </div>
    );

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 mt-2 ">
                    <h1 className="text-3xl font-bold" style={{ color: '#1A73E8' }}>Dashboard</h1>
                    <p className="mt-2 text-600">Welcome back, {user?.name}!</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }} className="mb-6 w-full">
                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)' }}>
                                <ShoppingCart size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">My Auctions</div>
                                <div className="text-xl font-medium" style={{ color: '#1A73E8' }}>{myAuctions.length}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)' }}>
                                <Trophy size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Won Auctions</div>
                                <div className="text-xl font-medium" style={{ color: '#FFB300' }}>{wonAuctions.length}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #FFB300 100%)' }}>
                                <DollarSign size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">My Bids</div>
                                <div className="text-xl font-medium" style={{ color: '#1A73E8' }}>{myBids.length}</div>
                            </div>
                        </div>
                    </Card>

                    {user?.role === 'admin' && (
                        <Card className="shadow-lg-modern hover-lift transition-smooth">
                            <div className="flex align-items-center">
                                <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' }}>
                                    <Users size={24} color="white" />
                                </div>
                                <div>
                                    <div className="text-sm text-500">Active Users</div>
                                    <div className="text-xl font-medium" style={{ color: '#4CAF50' }}>{activeUsers}</div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* User Statistics Chart - Admin Only */}
                {user?.role === 'admin' && chartData && (
                    <Card title="Platform Statistics" className="shadow-modern mb-6">
                        <div className="w-full" style={{ height: '400px' }}>
                            <Chart
                                type="bar"
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        title: {
                                            display: true,
                                            text: 'User and Auction Statistics',
                                            font: {
                                                size: 16,
                                                weight: 'bold'
                                            },
                                            color: '#1A73E8'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                color: '#64748B'
                                            },
                                            grid: {
                                                color: '#E5E7EB'
                                            }
                                        },
                                        x: {
                                            ticks: {
                                                color: '#64748B'
                                            },
                                            grid: {
                                                color: '#E5E7EB'
                                            }
                                        }
                                    }
                                }}
                                style={{ height: '100%' }}
                            />
                        </div>
                    </Card>
                )}

                {/* Recent Auctions */}
                <Card title="My Recent Auctions" className="shadow-modern mb-4">
                    {myAuctions.length > 0 ? (
                        <DataTable value={myAuctions.slice(0, 3)} className="p-datatable-sm">
                            <Column body={myAuctionsTemplate} header="Auction" />
                            <Column body={statusTemplate} header="Status" />
                        </DataTable>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-500">No auctions yet. Create your first auction!</p>
                        </div>
                    )}
                </Card>

                {/* Won Auctions */}
                <Card title="Auctions Won" className="shadow-modern mb-4">
                    {wonAuctions.length > 0 ? (
                        <DataTable value={wonAuctions.slice(0, 3)} className="p-datatable-sm">
                            <Column body={wonAuctionsTemplate} header="Auction" />
                            <Column body={paymentTemplate} header="Payment" />
                        </DataTable>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-500">No auctions won yet. Start bidding!</p>
                        </div>
                    )}
                </Card>

                {/* User Info */}
                <Card title="Account Information" className="shadow-modern">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-1">
                        <div>
                            <p className="text-sm text-500">Name</p>
                            <p className="text-sm font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-500">Email</p>
                            <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-500">Role</p>
                            <p className="text-sm font-medium capitalize">{user?.role}</p>
                        </div>
                        <div>
                            <p className="text-sm text-500">Verification Status</p>
                            <Tag
                                className='capitalize'
                                value={user?.verificationStatus || 'Not verified'}
                                severity={
                                    user?.verificationStatus === 'verified' ? 'success' :
                                        user?.verificationStatus === 'rejected' ? 'danger' : 'warning'
                                }
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;