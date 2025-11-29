import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Bell } from 'lucide-react';

const Navigation: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, fetchNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const start = (
        <Link to="/" className="text-2xl font-bold text-primary mr-6">
            Aucto
        </Link>
    );

    const items = isAuthenticated ? [
        ...(user?.role !== 'admin' ? [{
            label: 'Dashboard',
            command: () => navigate('/dashboard')
        }] : []),
        {
            label: 'Browse Auctions',
            command: () => navigate('/auctions')
        },
        ...(user?.role !== 'admin' ? [{
            label: 'Profile',
            command: () => navigate('/profile')
        }] : []),
        ...(user?.role === 'admin' ? [{
            label: 'Admin Panel',
            command: () => navigate('/admin')
        }] : []),
        ...((user?.role === 'user') ? [{
            label: 'Create Auction',
            command: () => navigate('/create-auction'),
            className: 'p-button-primary'
        }] : [])
    ] : [];

    const end = isAuthenticated ? (
        <div className="flex align-items-center gap-2">
            <Link to="/notifications" className="p-link shadow-lg p-3" style={{ backgroundColor: '#FFB300' }}>
                <Bell size={18} color='white' />
                {unreadCount > 0 && <Badge value={unreadCount > 99 ? '99+' : unreadCount.toString()} severity="danger" />}
            </Link>
            <Button label="Logout" icon="pi pi-sign-out" className="p-button-danger" onClick={handleLogout} />
        </div>
    ) : (
        <div className="flex align-items-center gap-2">
            <Button label="Login" className="p-button-primary" onClick={() => navigate('/login')} />
            <Button label="Register" className="p-button-primary" onClick={() => navigate('/register')} />
        </div>
    );

    return (
        <>
            <div className='bg-white shadow-modern'>
                <Menubar model={items} start={start} end={end} style={{ padding: '1rem 0.5rem' }} className="max-w-7xl mx-auto bg-transparent border-none" />
            </div>
        </>
    );
};

export default Navigation;