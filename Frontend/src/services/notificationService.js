// Notification Service API
import apiClient from '../api/axios';

export const notificationService = {
  // Get user's notifications with filtering
  getUserNotifications: async (page = 1, limit = 20, type = '', isRead = null) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      if (isRead !== null) params.isRead = isRead;

      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error.response?.data || error;
    }
  },

  // Get notification summary for dashboard
  getNotificationSummary: async () => {
    try {
      const response = await apiClient.get('/notifications/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification summary:', error);
      throw error.response?.data || error;
    }
  },

  // Get notifications by specific type
  getNotificationsByType: async (type) => {
    try {
      const response = await apiClient.get(`/notifications/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error.response?.data || error;
    }
  },

  // Mark specific notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response?.data || error;
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await apiClient.delete('/notifications/delete-all');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error.response?.data || error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error.response?.data || error;
    }
  },

  // Create notification (admin/system use)
  createNotification: async (notificationData) => {
    try {
      const response = await apiClient.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error.response?.data || error;
    }
  }
};

export default notificationService;
