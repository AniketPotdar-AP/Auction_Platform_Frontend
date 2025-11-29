import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../stores/notificationStore';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import {
    DollarSign,
    TrendingDown,
    Trophy,
    Frown,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Star,
    IdCard,
    Bell
} from 'lucide-react';

const Notifications: React.FC = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    const getNotificationIcon = (type: string) => {
        const iconProps = { size: 24, className: "text-primary" };
        switch (type) {
            case 'bid_received':
                return <DollarSign {...iconProps} />;
            case 'outbid':
                return <TrendingDown {...iconProps} />;
            case 'auction_won':
                return <Trophy {...iconProps} />;
            case 'auction_lost':
                return <Frown {...iconProps} />;
            case 'auction_ending_soon':
                return <Clock {...iconProps} />;
            case 'auction_approved':
                return <CheckCircle {...iconProps} />;
            case 'auction_rejected':
                return <XCircle {...iconProps} />;
            case 'payment_required':
                return <CreditCard {...iconProps} />;
            case 'payment_successful':
                return <DollarSign {...iconProps} />;
            case 'review_received':
                return <Star {...iconProps} />;
            case 'aadhaar_verified':
                return <IdCard {...iconProps} />;
            case 'aadhaar_rejected':
                return <XCircle {...iconProps} />;
            default:
                return <Bell {...iconProps} />;
        }
    };

    if (isLoading && notifications.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex align-items-center justify-content-center">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-content-between align-items-center mb-4 mt-4">
                    <h1 className="text-3xl font-bold mb-4">Notifications</h1>
                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            label="Mark All as Read"
                            icon="pi pi-check"
                            className="p-button-primary"
                        />
                    )}
                </div>

                {/* Content */}
                {error && (
                    <Message severity="error" text={error} className="mb-4" />
                )}

                {notifications.length === 0 ? (
                    <Card className="text-center shadow-modern">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
                        <p className="text-600">You'll receive notifications about your auctions and bids here.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification._id}
                                className={`shadow-modern ${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
                            >
                                <div className="flex align-items-start">
                                    <div className="shrink-0 mr-3">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <h4 className="text-lg font-medium">
                                                {notification.title}
                                                {!notification.isRead && <Badge value="New" severity="info" className="ml-2" />}
                                            </h4>
                                            <div className="flex align-items-center gap-2">
                                                <span className="text-sm text-500">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                {!notification.isRead && (
                                                    <Button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        label="Mark as Read"
                                                        size="small"
                                                        className="p-button-primary"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-700 mb-2">
                                            {notification.message}
                                        </p>
                                        {notification.auction && (
                                            <Link to={`/auctions/${notification.auction}`}>
                                                <Button label="View Auction" icon="pi pi-arrow-right" className="p-button-link" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;