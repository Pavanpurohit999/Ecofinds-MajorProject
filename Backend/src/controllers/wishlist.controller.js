const Wishlist = require("../models/Wishlist.model");
const Product = require("../models/Product.model");
const asyncHandler = require("../utils/asynchandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

// Toggle wishlist item (Add if not exists, remove if exists)
const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ userId, productId });

    if (existingWishlist) {
        // Remove from wishlist
        await Wishlist.findByIdAndDelete(existingWishlist._id);

        // Decrement likes count on product
        product.likesCount = Math.max(0, (product.likesCount || 0) - 1);
        await product.save();

        return res.status(200).json(
            new ApiResponse(200, { isWishlisted: false, likesCount: product.likesCount }, "Removed from wishlist")
        );
    } else {
        // Add to wishlist
        await Wishlist.create({ userId, productId });

        // Increment likes count on product
        product.likesCount = (product.likesCount || 0) + 1;
        await product.save();

        return res.status(200).json(
            new ApiResponse(200, { isWishlisted: true, likesCount: product.likesCount }, "Added to wishlist")
        );
    }
});

// Get user's wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const wishlistItems = await Wishlist.find({ userId })
        .populate({
            path: "productId",
            select: "productTitle price imageUrl imageUrls imageDetails category location isActive"
        })
        .sort({ createdAt: -1 });

    // Filter out items where the product might have been deleted
    const products = wishlistItems
        .filter(item => item.productId)
        .map(item => item.productId);

    res.status(200).json(
        new ApiResponse(200, products, "Wishlist fetched successfully")
    );
});

// Check if a specific product is in user's wishlist
const checkWishlistStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const exists = await Wishlist.exists({ userId, productId });

    res.status(200).json(
        new ApiResponse(200, { isWishlisted: !!exists }, "Wishlist status checked")
    );
});

module.exports = {
    toggleWishlist,
    getWishlist,
    checkWishlistStatus
};
