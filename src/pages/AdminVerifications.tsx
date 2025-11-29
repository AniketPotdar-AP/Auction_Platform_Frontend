import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
}

const AdminVerifications: React.FC = () => {
    const { user } = useAuthStore();
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);
    const [, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchPendingVerifications();
        }
    }, [user]);

    const fetchPendingVerifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-verifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPendingVerifications(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending verifications:', error);
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
                fetchPendingVerifications(); // Refresh data
            } else {
                alert(data.message || 'Failed to verify Aadhaar');
            }
        } catch (error) {
            console.error('Error verifying Aadhaar:', error);
            alert('Failed to verify Aadhaar');
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
                    <h1 className="text-2xl font-bold" style={{ color: '#1A73E8' }}>User Verifications</h1>
                    <p className="mt-1 text-gray-600">Review and verify user Aadhaar documents</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto py-6">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Pending Aadhaar Verifications
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Review and verify user Aadhaar documents to grant auction creation permissions
                        </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {pendingVerifications.length > 0 ? pendingVerifications.map((user) => (
                            <li key={user._id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-[#1A73E8] flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400">
                                                Registered: {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleVerifyAadhaar(user._id, 'verified')}
                                            className="bg-[#1A73E8] text-white px-4 py-2 rounded text-sm hover:bg-[#1557B0] transition-colors"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => handleVerifyAadhaar(user._id, 'rejected')}
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
                                    <p className="text-lg font-medium">All caught up!</p>
                                    <p className="text-sm">No pending verifications at the moment.</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminVerifications;