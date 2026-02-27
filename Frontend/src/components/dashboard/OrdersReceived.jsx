import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const OrdersReceived = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Fetch orders when component mounts or tab changes
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderService.getSellerOrders(1, 20, activeTab === 'all' ? '' : activeTab);

        if (response.success) {
          setOrders(response.data.orders || []);
        } else {
          setError(response.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching seller orders:', err);
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

      const response = await orderService.getSellerOrders(1, 20, activeTab === 'all' ? '' : activeTab);

      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const response = await orderService.updateOrderStatus(orderId, { action: 'accept' });

      if (response.success) {
        // Refresh orders after accepting
        fetchOrders();
        setShowModal(false);
        alert('Order accepted successfully!');
      } else {
        alert('Failed to accept order: ' + response.message);
      }
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const response = await orderService.updateOrderStatus(orderId, { action: 'cancel', notes: 'Order declined by seller' });

      if (response.success) {
        // Refresh orders after declining
        fetchOrders();
        setShowModal(false);
        alert('Order declined successfully!');
      } else {
        alert('Failed to decline order: ' + response.message);
      }
    } catch (err) {
      console.error('Error declining order:', err);
      alert('Failed to decline order: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);

      // Map status to action
      const statusToAction = {
        'pending': null, // Cannot change to pending
        'confirmed': 'accept',
        'processing': 'process',
        'shipped': 'ship',
        'completed': 'complete',
        'cancelled': 'cancel'
      };

      const action = statusToAction[newStatus];
      if (!action) {
        alert('Invalid status update');
        return;
      }

      let payload = { action };

      // Special handling for cancel action - ask for reason
      if (action === 'cancel') {
        const reason = prompt('Please enter cancellation reason (optional):');
        if (reason) {
          payload.notes = reason;
        }
      }

      const response = await orderService.updateOrderStatus(orderId, payload);

      if (response.success) {
        fetchOrders();
        setShowModal(false);
        alert(`Order status updated to ${newStatus} successfully!`);
      } else {
        alert('Failed to update order status: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.message || 'Unknown error'));
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const tabs = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status?.toLowerCase() === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status?.toLowerCase() === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status?.toLowerCase() === 'shipped').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status?.toLowerCase() === 'completed').length }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Received</h1>
          <p className="text-gray-600">Manage orders from your customers</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                    ? 'border-[#782355] text-[#782355]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{order.itemName || 'Order Item'}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium">{order.quantity || 1}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <p className="font-medium">{order.buyerInfo?.name || order.buyerId?.name || 'Unknown Buyer'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Order Date:</span>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <p className="font-bold text-[#782355] text-lg">{formatCurrency(order.totalPrice || order.totalAmount || 0)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Contact:</span>
                      <p className="font-medium">{order.buyerInfo?.phone || order.buyerId?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Order ID:</span>
                      <p className="font-medium font-mono text-xs">{order._id}</p>
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-gray-700 text-sm mt-1">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </button>

                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        {actionLoading ? 'Processing...' : 'Accept Order'}
                      </button>
                      <button
                        onClick={() => handleDeclineOrder(order._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        {actionLoading ? 'Processing...' : 'Decline'}
                      </button>
                    </div>
                  )}

                  {order.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/chat?userId=${order.buyerId?._id || order.buyerId}`)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders from customers will appear here</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Header */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedOrder.itemName || 'Order Item'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">Order ID: {selectedOrder._id}</p>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Information</label>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedOrder.buyerInfo?.name || selectedOrder.buyerId?.name || 'Unknown Buyer'}</span>
                      </div>
                      {(selectedOrder.buyerInfo?.phone || selectedOrder.buyerId?.phone) && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">Phone: {selectedOrder.buyerInfo?.phone || selectedOrder.buyerId?.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedOrder.quantity || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <div className="flex items-center space-x-2">
                        <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-bold text-[#782355]">{formatCurrency(selectedOrder.totalPrice || selectedOrder.totalAmount || 0)}</span>
                      </div>
                    </div>

                    {selectedOrder.paymentStatus && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    )}

                    {selectedOrder.updatedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700">{selectedOrder.specialInstructions}</p>
                    </div>
                  </div>
                )}

                {/* Order Status Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Actions</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(selectedOrder._id)}
                          disabled={actionLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                        >
                          {actionLoading ? 'Processing...' : 'Accept Order'}
                        </button>
                        <button
                          onClick={() => handleDeclineOrder(selectedOrder._id)}
                          disabled={actionLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                        >
                          {actionLoading ? 'Processing...' : 'Decline Order'}
                        </button>
                      </>
                    )}

                    {selectedOrder.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'processing')}
                        disabled={statusUpdateLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                      >
                        {statusUpdateLoading ? 'Processing...' : 'Start Processing'}
                      </button>
                    )}

                    {selectedOrder.status === 'processing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'shipped')}
                        disabled={statusUpdateLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                      >
                        {statusUpdateLoading ? 'Processing...' : 'Mark as Shipped'}
                      </button>
                    )}

                    {selectedOrder.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'completed')}
                        disabled={statusUpdateLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                      >
                        {statusUpdateLoading ? 'Processing...' : 'Complete Order'}
                      </button>
                    )}

                    {['pending', 'confirmed', 'processing'].includes(selectedOrder.status) && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'cancelled')}
                        disabled={statusUpdateLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                      >
                        {statusUpdateLoading ? 'Processing...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersReceived;
