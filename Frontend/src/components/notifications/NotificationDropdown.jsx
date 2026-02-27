import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
// Using standard hero icons or similar if available, fallback to basic SVG
// Assuming you have lucide-react or similar based on typical Vite setup, 
// let's use a standard SVG to be safe without knowing exact icon library
import { FiBell } from 'react-icons/fi'; // react-icons is in package.json

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        setIsOpen(false);

        // Handle navigation based on notification type here
        // e.g., if (notif.type === 'order_placed') navigate(`/order/${notif.data.orderId}`)
    };

    const getNotificationIcon = (type) => {
        // Return different colors/icons based on type
        switch (type) {
            case 'order_placed': return 'bg-blue-100 text-blue-600';
            case 'material_request_sent': return 'bg-purple-100 text-purple-600';
            case 'system_announcement': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-green-100 text-green-600';
        }
    };

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-green-600 focus:outline-none transition-colors duration-200"
            >
                <FiBell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 transform origin-top-right transition-all duration-200 ease-out">
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <li
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${!notif.isRead ? 'bg-green-50/30' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationIcon(notif.type)}`}>
                                                <FiBell size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                        <button
                            className="text-xs text-gray-500 hover:text-green-600 font-medium w-full py-1"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
