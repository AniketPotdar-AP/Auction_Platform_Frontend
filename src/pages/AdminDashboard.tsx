import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ShoppingCart, Trophy, DollarSign, Users, TrendingUp, UserCheck, Gavel } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
}

interface Auction {
    _id: string;
    title: string;
    seller: { name: string };
    status: string;
    isApproved: boolean;
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [activeUsers, setActiveUsers] = useState(0);
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        activeAuctions: 0,
        totalAuctions: 0
    });
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
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
            const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/stats`);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setUserStats(statsData);

                // Prepare chart data
                setChartData({
                    labels: ['Total Users', 'Verified Users', 'Active Auctions', 'Total Auctions'],
                    datasets: [{
                        label: 'Platform Statistics',
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
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAadhaar = async (userId: string, status: 'verified' | 'rejected', notes?: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/verify-aadhaar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Aadhaar ${status} successfully`);
                fetchDashboardData(); // Refresh data
            } else {
                alert(data.message || 'Failed to verify Aadhaar');
            }
        } catch (error) {
            console.error('Error verifying Aadhaar:', error);
            alert('Failed to verify Aadhaar');
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
                fetchDashboardData(); // Refresh data
            } else {
                alert(data.message || 'Failed to approve auction');
            }
        } catch (error) {
            console.error('Error approving auction:', error);
            alert('Failed to approve auction');
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-6xl mx-auto py-4">
                    <h1 className="text-2xl font-bold" style={{ color: '#1A73E8' }}>Admin Dashboard</h1>
                    <p className="mt-1 text-gray-600">Platform overview and management</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-6">
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }} className="mb-6 w-full">
                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)' }}>
                                <Users size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Total Users</div>
                                <div className="text-xl font-medium" style={{ color: '#1A73E8' }}>{userStats.totalUsers}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)' }}>
                                <UserCheck size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Verified Users</div>
                                <div className="text-xl font-medium" style={{ color: '#FFB300' }}>{userStats.verifiedUsers}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' }}>
                                <Gavel size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Active Auctions</div>
                                <div className="text-xl font-medium" style={{ color: '#4CAF50' }}>{userStats.activeAuctions}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                                <TrendingUp size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Total Auctions</div>
                                <div className="text-xl font-medium" style={{ color: '#FF9800' }}>{userStats.totalAuctions}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-lg-modern hover-lift transition-smooth">
                        <div className="flex align-items-center">
                            <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3" style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)' }}>
                                <Users size={24} color="white" />
                            </div>
                            <div>
                                <div className="text-sm text-500">Active Users (24h)</div>
                                <div className="text-xl font-medium" style={{ color: '#9C27B0' }}>{activeUsers}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Platform Statistics Chart */}
                {chartData && (
                    <Card title="Platform Statistics Overview" className="shadow-modern mb-6">
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
                                            text: 'Platform Metrics',
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

                {/* Quick Actions */}
                <Card title="Quick Actions" className="shadow-modern">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/verifications'}
                            className="p-4 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors"
                        >
                            <div className="flex items-center">
                                <UserCheck size={24} className="mr-3" />
                                <div>
                                    <div className="font-medium">Manage Verifications</div>
                                    <div className="text-sm opacity-90">Review user documents</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => window.location.href = '/auctions'}
                            className="p-4 bg-[#FFB300] text-white rounded-lg hover:bg-[#FF8F00] transition-colors"
                        >
                            <div className="flex items-center">
                                <Gavel size={24} className="mr-3" />
                                <div>
                                    <div className="font-medium">Browse Auctions</div>
                                    <div className="text-sm opacity-90">View all listings</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => window.location.href = '/admin/approvals'}
                            className="p-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition-colors"
                        >
                            <div className="flex items-center">
                                <TrendingUp size={24} className="mr-3" />
                                <div>
                                    <div className="font-medium">Auction Approvals</div>
                                    <div className="text-sm opacity-90">Review pending auctions</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;