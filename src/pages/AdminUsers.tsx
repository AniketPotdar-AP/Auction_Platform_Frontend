import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Edit, Trash2 } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    verificationStatus: 'pending' | 'verified' | 'rejected';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

const AdminUsers: React.FC = () => {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'user' as 'user' | 'admin',
        isActive: true
    });
    const toast = React.useRef<Toast>(null);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch users'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter out admin users and then apply search/filters
    const nonAdminUsers = users.filter(user => user.role !== 'admin');

    const filteredUsers = nonAdminUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
        setEditDialogVisible(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User updated successfully'
                });
                setEditDialogVisible(false);
                fetchUsers();
            } else {
                throw new Error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update user'
            });
        }
    };

    const handleDeleteUser = (user: User) => {
        confirmDialog({
            message: `Are you sure you want to delete ${user.name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User deleted successfully'
                        });
                        fetchUsers();
                    } else {
                        throw new Error('Failed to delete user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete user'
                    });
                }
            }
        });
    };

    const roleTemplate = (rowData: User) => (
        <Tag className='capitalize'
            value={rowData.role}
            severity={rowData.role === 'admin' ? 'danger' : 'info'}
        />
    );

    const statusTemplate = (rowData: User) => (
        <Tag className='capitalize'
            value={rowData.isActive ? 'Active' : 'Inactive'}
            severity={rowData.isActive ? 'success' : 'warning'}
        />
    );

    const verificationTemplate = (rowData: User) => (
        <Tag className='capitalize'
            value={rowData.verificationStatus}
            severity={
                rowData.verificationStatus === 'verified' ? 'success' :
                    rowData.verificationStatus === 'rejected' ? 'danger' : 'warning'
            }
        />
    );

    const actionsTemplate = (rowData: User) => (
        <div className="flex gap-2">
            <Button
                icon={<Edit size={16} />}
                className="p-button-rounded p-button-text p-button-info"
                onClick={() => handleEditUser(rowData)}
                tooltip="Edit User"
            />
            <Button
                icon={<Trash2 size={16} />}
                className="p-button-rounded p-button-text p-button-danger"
                onClick={() => handleDeleteUser(rowData)}
                tooltip="Delete User"
            />
        </div>
    );

    const roleOptions = [
        { label: 'All Users', value: 'all' },
        { label: 'Regular Users', value: 'user' }
    ];

    const statusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
    ];

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access user management.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 adminUsers">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: '#1A73E8' }}>User Management</h1>
                            <p className="mt-1 text-gray-600">Manage regular users and their account settings</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600">{nonAdminUsers.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 px-4">
                {/* Filters */}
                <Card className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-field">
                            <label className="block text-sm font-medium mb-2">Search Users</label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-search text-gray-400"></i>
                                <InputText
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10"
                                    keyfilter={undefined}
                                />
                            </span>
                        </div>

                        <div className="p-field">
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <Dropdown
                                value={roleFilter}
                                options={roleOptions}
                                onChange={(e) => setRoleFilter(e.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="p-field">
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Dropdown
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(e) => setStatusFilter(e.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="p-field">
                            <label className="block text-sm font-medium mb-2">Actions</label>
                            <Button
                                label="Refresh"
                                icon="pi pi-refresh"
                                onClick={fetchUsers}
                                loading={loading}
                                className="w-full"
                            />
                        </div>
                    </div>
                </Card>

                {/* Users Table */}
                <Card>
                    <DataTable
                        value={filteredUsers}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        emptyMessage="No users found"
                        className="p-datatable-sm"
                    >
                        <Column field="name" header="Name" sortable />
                        <Column field="email" header="Email" sortable />
                        <Column field="role" header="Role" body={roleTemplate} sortable />
                        <Column field="verificationStatus" header="Verification" body={verificationTemplate} sortable />
                        <Column field="isActive" header="Status" body={statusTemplate} sortable />
                        <Column field="createdAt" header="Joined" body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()} sortable />
                        <Column header="Actions" body={actionsTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Edit User Dialog */}
            <Dialog
                header="Edit User"
                visible={editDialogVisible}
                onHide={() => setEditDialogVisible(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setEditDialogVisible(false)}
                        />
                        <Button
                            label="Update"
                            icon="pi pi-check"
                            className="p-button-primary"
                            onClick={handleUpdateUser}
                        />
                    </div>
                }
            >
                <div className="grid grid-cols-1 gap-4 p-4">
                    <div className="p-field">
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <InputText
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full"
                        />
                    </div>

                    <div className="p-field">
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <InputText
                            value={editForm.email}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full"
                        />
                    </div>

                    <div className="p-field">
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <Dropdown
                            value={editForm.role}
                            options={[
                                { label: 'Regular User', value: 'user' }
                            ]}
                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.value }))}
                            className="w-full"
                            disabled
                        />
                    </div>

                    <div className="p-field">
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Dropdown
                            value={editForm.isActive}
                            options={[
                                { label: 'Active', value: true },
                                { label: 'Inactive', value: false }
                            ]}
                            onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.value }))}
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminUsers;