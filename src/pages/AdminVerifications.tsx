import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
    aadhaarNumber?: string;
    aadhaarImages?: string[];
    phone?: string;
    address?: string;
    sellerRating?: number;
    totalReviews?: number;
}

interface DetailedUser extends User {
    avatar?: string;
    userType?: string;
    permissions?: {
        canBid: boolean;
        canCreateAuction: boolean;
    };
    verifiedAt?: string;
    verificationNotes?: string;
}

const AdminVerifications: React.FC = () => {
    const { user } = useAuthStore();
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);
    const [, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
    const [userDetailsVisible, setUserDetailsVisible] = useState(false);
    const [, setUserDetailsLoading] = useState(false);

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

    const handleViewUserDetails = async (userId: string) => {
        setUserDetailsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setSelectedUser(data.data);
                setUserDetailsVisible(true);
            } else {
                alert('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            alert('Failed to fetch user details');
        } finally {
            setUserDetailsLoading(false);
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
                            <li key={user._id} className="px-4 py-6 sm:px-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-[#1A73E8] flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending Verification
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{user.email}</p>

                                            {/* Aadhaar Details */}
                                            {user.aadhaarNumber && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-medium text-gray-900">Aadhaar Details</p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        <span className="font-medium">Number:</span> {user.aadhaarNumber}
                                                    </p>

                                                    {/* Aadhaar Images */}
                                                    {user.aadhaarImages && user.aadhaarImages.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                                            {user.aadhaarImages.map((image, index) => (
                                                                <div key={index} className="relative">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Aadhaar ${index === 0 ? 'Front' : 'Back'}`}
                                                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                        {index === 0 ? 'Front' : 'Back'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-400 mt-2">
                                                Registered: {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2 ml-4">
                                        <button
                                            onClick={() => handleViewUserDetails(user._id)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                                        >
                                            View Details
                                        </button>
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

            {/* User Details Modal */}
            <Dialog
                header="User Details"
                visible={userDetailsVisible}
                onHide={() => setUserDetailsVisible(false)}
                style={{ width: '50vw' }}
                className="p-fluid"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* User Avatar and Basic Info */}
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-[#1A73E8] flex items-center justify-center">
                                {selectedUser.avatar ? (
                                    <img
                                        src={selectedUser.avatar}
                                        alt={selectedUser.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-medium text-xl">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                <p className="text-gray-600">{selectedUser.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Tag
                                        value={selectedUser.role}
                                        severity="info"
                                    />
                                    <Tag
                                        value={selectedUser.verificationStatus}
                                        severity={
                                            selectedUser.verificationStatus === 'verified' ? 'success' :
                                                selectedUser.verificationStatus === 'rejected' ? 'danger' : 'warning'
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Contact Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                                    <p><span className="font-medium">Address:</span> {selectedUser.address || 'Not provided'}</p>
                                </div>

                                <h4 className="font-semibold text-lg mt-6">Account Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">User Type:</span> {selectedUser.userType || 'Standard'}</p>
                                    <p><span className="font-medium">Seller Rating:</span> {selectedUser.sellerRating ? `${selectedUser.sellerRating}/5` : 'Not rated'}</p>
                                    <p><span className="font-medium">Total Reviews:</span> {selectedUser.totalReviews || 0}</p>
                                    <p><span className="font-medium">Registered:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    {selectedUser.verifiedAt && (
                                        <p><span className="font-medium">Verified At:</span> {new Date(selectedUser.verifiedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Permissions</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Can Bid:</span>
                                        <Tag
                                            value={selectedUser.permissions?.canBid ? 'Yes' : 'No'}
                                            severity={selectedUser.permissions?.canBid ? 'success' : 'danger'}
                                            className="ml-2"
                                        />
                                    </p>
                                    <p><span className="font-medium">Can Create Auctions:</span>
                                        <Tag
                                            value={selectedUser.permissions?.canCreateAuction ? 'Yes' : 'No'}
                                            severity={selectedUser.permissions?.canCreateAuction ? 'success' : 'danger'}
                                            className="ml-2"
                                        />
                                    </p>
                                </div>

                                {selectedUser.verificationNotes && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-lg">Verification Notes</h4>
                                        <p className="text-gray-600 mt-2">{selectedUser.verificationNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aadhaar Information */}
                        {selectedUser.aadhaarNumber && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-lg">Aadhaar Information</h4>
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                    <p className="mb-3"><span className="font-medium">Aadhaar Number:</span> {selectedUser.aadhaarNumber}</p>
                                    {selectedUser.aadhaarImages && selectedUser.aadhaarImages.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-2">Aadhaar Images:</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedUser.aadhaarImages.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image}
                                                            alt={`Aadhaar ${index === 0 ? 'Front' : 'Back'}`}
                                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                            {index === 0 ? 'Front' : 'Back'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default AdminVerifications;