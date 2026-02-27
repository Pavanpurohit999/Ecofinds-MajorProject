import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { socket, isConnected } = useSocket();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch initial notifications when authenticated
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated || !user) return;

        try {
            setLoading(true);
            // Fetch summary for unread count
            const summary = await notificationService.getNotificationSummary();
            setUnreadCount(summary.unreadCount || 0);

            // Fetch recent notifications
            const data = await notificationService.getUserNotifications(1, 10);
            // The API might return { notifications: [...], pagination: {...} } or just the array.
            // Assuming typical pagination structure:
            const notifs = data.notifications || data;
            setNotifications(Array.isArray(notifs) ? notifs : []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Listen for real-time notifications via socket
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewNotification = (notification) => {
            console.log('New notification received via socket:', notification);

            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Optional: Show a toast here if you want global toasts
            // import { toast } from 'react-hot-toast'; toast.success(notification.title);
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, isConnected]);

    // Actions
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markNotificationAsRead(notificationId);

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );

            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, isRead: true }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            setNotifications((prev) => {
                const notif = prev.find(n => n._id === notificationId);
                if (notif && !notif.isRead) {
                    setUnreadCount(count => Math.max(0, count - 1));
                }
                return prev.filter((n) => n._id !== notificationId);
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
