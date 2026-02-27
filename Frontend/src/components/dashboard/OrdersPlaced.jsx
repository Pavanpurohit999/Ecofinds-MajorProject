import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const OrdersPlaced = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch orders when component mounts or tab changes
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderService.getBuyerOrderHistory(1, 20, activeTab === 'all' ? '' : activeTab);

        if (response.success) {
          setOrders(response.data.orders || []);
        } else {
          setError(response.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getBuyerOrderHistory(1, 20, activeTab === 'all' ? '' : activeTab);

      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await orderService.cancelOrder(orderId, 'User requested cancellation');

      if (response.success) {
        // Refresh orders after cancellation
        fetchOrders();
      } else {
        alert('Failed to cancel order: ' + response.message);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order: ' + (err.message || 'Unknown error'));
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '⚙️';
      case 'shipped': return '🚚';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const getDeliveryIcon = (delivery) => {
    return delivery === 'pickup' ? '🚶' : '🚛';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
          <p className="text-gray-600">Track your orders and purchases</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py - 4 px - 1 border - b - 2 font - medium text - sm whitespace - nowrap transition - colors duration - 200 ${activeTab === tab.id
                      ? 'border-[#782355] text-[#782355]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } `}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="animate-spin mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Loading orders...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-[#782355] text-white px-6 py-3 rounded-lg hover:bg-[#8e2a63] transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{order.itemName || 'Unknown Item'}</h3>
                        <span className={`inline - flex items - center px - 3 py - 1 rounded - full text - sm font - medium ${getStatusColor(order.status)} `}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Order Details */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-500 text-sm">Quantity:</span>
                            <p className="font-semibold text-gray-900">{order.quantity} {order.unit || 'units'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Supplier:</span>
                            <p className="font-semibold text-gray-900">{order.sellerId?.name || order.sellerId?.username || 'Unknown'}</p>
                          </div>
                        </div>

                        {/* Contact & Delivery */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-500 text-sm">Phone:</span>
                            <p className="font-semibold text-gray-900">{order.sellerId?.phone || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Delivery:</span>
                            <p className="flex items-center gap-2 font-semibold text-gray-900">
                              <span>{getDeliveryIcon(order.deliveryType)}</span>
                              {order.deliveryType || 'pickup'}
                            </p>
                          </div>
                        </div>

                        {/* Dates & Total */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-500 text-sm">Expected:</span>
                            <p className="font-semibold text-gray-900">
                              {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Ordered:</span>
                            <p className="font-semibold text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#782355]/10 to-purple-600/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Total Amount:</span>
                          <span className="text-2xl font-bold text-[#782355]">₹{order.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:min-w-[160px]">
                      {order.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/ chat ? userId = ${order.sellerId?._id || order.sellerId} `)}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          Chat
                        </button>
                      )}

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          <XCircleIcon className="h-5 w-5" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Active Orders */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Order Progress</span>
                      <span>{order.status}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#782355] to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: order.status === 'pending' ? '25%' :
                            order.status === 'confirmed' ? '50%' :
                              order.status === 'processing' ? '75%' :
                                order.status === 'shipped' ? '90%' : '100%'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Placed</span>
                      <span>Confirmed</span>
                      <span>Processing</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders placed yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <button className="bg-[#782355] text-white px-6 py-3 rounded-lg hover:bg-[#8e2a63] transition-colors duration-200">
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPlaced;
