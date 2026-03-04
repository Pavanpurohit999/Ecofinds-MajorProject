import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../landing/ProductCard';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
    const { wishlist, loading } = useWishlist();
    const navigate = useNavigate();

    if (loading && wishlist.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#782355]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                <p className="text-gray-600">Products you've saved for later</p>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <ProductCard
                            key={product._id || product.id}
                            product={product}
                            onViewDetails={(p) => navigate(`/product/${p._id || p.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-6 text-center max-w-sm mx-auto px-4">
                        Save items you're interested in by clicking the heart icon on any product.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-[#782355] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#8e2a63] transition-all transform active:scale-95 shadow-lg shadow-purple-100"
                    >
                        Explore Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
