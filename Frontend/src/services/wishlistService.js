import apiClient from '../api/axios';

const wishlistService = {
    // Get user's wishlist
    getWishlist: async () => {
        try {
            const response = await apiClient.get('/wishlist');
            return response.data;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw error.response?.data || error;
        }
    },

    // Toggle wishlist item
    toggleWishlist: async (productId) => {
        try {
            const response = await apiClient.post(`/wishlist/toggle/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            throw error.response?.data || error;
        }
    },

    // Check wishlist status
    checkWishlistStatus: async (productId) => {
        try {
            const response = await apiClient.get(`/wishlist/status/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking wishlist status:', error);
            throw error.response?.data || error;
        }
    }
};

export default wishlistService;
