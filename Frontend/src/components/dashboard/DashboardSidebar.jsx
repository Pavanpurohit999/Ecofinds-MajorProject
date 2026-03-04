import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  DocumentCheckIcon,
  BellIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

const DashboardSidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'profile',
      icon: UserIcon,
      label: 'My Profile',
      path: '/dashboard/profile',
      color: 'text-blue-600'
    },
    {
      id: 'listings',
      icon: ClipboardDocumentListIcon,
      label: 'My Listings',
      path: '/dashboard/listings',
      color: 'text-green-600'
    },
    {
      id: 'orders-received',
      icon: ShoppingBagIcon,
      label: 'Orders Received',
      path: '/dashboard/orders-received',
      color: 'text-orange-600'
    },
    {
      id: 'orders-placed',
      icon: DocumentCheckIcon,
      label: 'My Purchases',
      path: '/dashboard/orders-placed',
      color: 'text-purple-600'
    },

    {
      id: 'notifications',
      icon: BellIcon,
      label: 'Notifications',
      path: '/dashboard/notifications',
      color: 'text-red-600'
    },
    {
      id: 'wishlist',
      icon: HeartIcon,
      label: 'My Wishlist',
      path: '/dashboard/wishlist',
      color: 'text-pink-600'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      {/* Header */}


      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${isActiveRoute(item.path)
                  ? 'bg-[#782355] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <item.icon className={`h-5 w-5 ${isActiveRoute(item.path) ? 'text-white' : item.color
                  }`} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}

    </div>
  );
};

export default DashboardSidebar;
