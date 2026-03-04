import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Helper to normalize IDs (handles MongoDB $oid, string IDs, etc.)
    const normalizeId = useCallback((id) => {
        if (!id) return null;
        if (typeof id === 'string') return id;
        if (typeof id === 'object') {
            return id.$oid || id._id || id.id || id.toString();
        }
        return String(id);
    }, []);

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setWishlist([]);
            setWishlistIds(new Set());
            return;
        }

        try {
            setLoading(true);
            const response = await wishlistService.getWishlist();
            // Backend ApiResponse structure: { status, data, message, success }
            if (response.success) {
                const items = response.data || [];
                setWishlist(items);
                const ids = new Set(items.map(item => normalizeId(item._id || item.id)));
                setWishlistIds(ids);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, normalizeId]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Please login to add to wishlist' };

        const id = normalizeId(productId);
        const wasWishlisted = wishlistIds.has(id);

        // Optimistic update
        setWishlistIds(prev => {
            const next = new Set(prev);
            if (wasWishlisted) next.delete(id);
            else next.add(id);
            return next;
        });

        try {
            const response = await wishlistService.toggleWishlist(id);
            if (response.success) {
                // If it was an add, we refetch to get full product data for the wishlist page
                if (response.data.isWishlisted) {
                    fetchWishlist();
                } else {
                    // Locally remove from wishlist array too
                    setWishlist(prev => prev.filter(item => normalizeId(item._id || item.id) !== id));
                }
                return { success: true, isWishlisted: response.data.isWishlisted };
            } else {
                // Rollback on failure
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    if (wasWishlisted) next.add(id);
                    else next.delete(id);
                    return next;
                });
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            // Rollback on error
            setWishlistIds(prev => {
                const next = new Set(prev);
                if (wasWishlisted) next.add(id);
                else next.delete(id);
                return next;
            });
            return { success: false, message: error.message || 'Something went wrong' };
        }
    };

    const isInWishlist = (productId) => {
        return wishlistIds.has(normalizeId(productId));
    };

    const value = {
        wishlist,
        loading,
        fetchWishlist,
        toggleWishlist,
        isInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
