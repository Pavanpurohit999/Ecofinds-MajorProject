import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import {
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import productService from "../services/productService";
import {
  paymentService,
  openRazorpayCheckout,
} from "../services/paymentService";
import { useRetry } from "../hooks/useUtils";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

// ✅ NEW: recommendation imports
import RecommendationRow from "../components/landing/RecommendationRow";
import {
  useSimilarProducts,
  useFrequentlyBoughtTogether,
} from "../hooks/useRecommendation.js";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { retryCount, canRetry, retry, reset } = useRetry();
  const { addToCart } = useCart();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // ✅ NEW: recommendation hooks based on current product id
  const {
    products: similarProducts,
    loading: similarLoading,
    error: similarError,
  } = useSimilarProducts(id);

  useEffect(() => {
    console.log("SIMILAR PRODUCTS RAW:", similarProducts);
    console.table(
      similarProducts?.map((p) => ({
        id: p._id ?? p.id,
        title: p.productTitle ?? p.title,
        price: p.price,
        img: p.imageUrl ?? (p.imageUrls && p.imageUrls[0]),
      }))
    );
  }, [similarProducts]);
  const {
    products: fbtProducts,
    loading: fbtLoading,
    error: fbtError,
  } = useFrequentlyBoughtTogether(id);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const productForCart = {
        id: product._id,
        title: product.productTitle,
        price: product.price,
        image: product.imageUrls?.[0] || product.imageUrl,
        condition: product.condition,
        location: product.location,
        seller: product.userId?.name || "Unknown Seller",
        inStock: product.quantity > 0,
      };

      addToCart(productForCart, selectedQuantity);

      // Show success message or navigate to cart
      navigate("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.quantity === 0) {
      alert("Product is out of stock");
      return;
    }

    // Prevent double clicking
    if (isProcessingPayment) {
      console.log("Payment already in progress, ignoring click");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const totalAmount = product.price * selectedQuantity;

      // Create order in backend
      const orderData = {
        items: [
          {
            productId: product._id,
            quantity: selectedQuantity,
            price: product.price,
          },
        ],
        totalAmount: totalAmount,
        currency: "INR",
      };

      const orderResponse = await paymentService.createOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const { order } = orderResponse.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_U0JVBIF0p05ory",
        amount: order.amount,
        currency: order.currency,
        name: "OdooXNMIT",
        description: `Purchase: ${product.productTitle}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: [
                {
                  id: product._id,
                  title: product.productTitle,
                  price: product.price,
                  quantity: selectedQuantity,
                  seller: product.userId?.name || "Unknown Seller",
                  sellerId: product.userId?._id,
                },
              ],
            });

            if (verifyResponse.success) {
              alert("Payment successful! Your order has been placed.");
              navigate("/dashboard/orders-placed");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#782355",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      // Open Razorpay checkout
      await openRazorpayCheckout(options);
    } catch (error) {
      console.error("Buy now error:", error);
      alert("Purchase failed: " + (error.message || "Unknown error"));
      setIsProcessingPayment(false);
    }
  };

  // Fetch product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching product with ID:", id);

        if (!id || id === "undefined") {
          throw new Error("Invalid product ID");
        }

        const response = await productService.getProductById(id);
        setProduct(response.data);
        reset(); // Reset retry count on successful fetch
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.response?.data?.message || "Failed to load product details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, retryCount, reset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#782355]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading product
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setError(null);
                retry();
              }}
              disabled={!canRetry}
              className="bg-[#782355] text-white px-6 py-2 rounded-lg hover:bg-[#8e2a63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canRetry ? "Try Again" : "Max Retries Reached"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Product not found
          </h3>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#782355] text-white px-6 py-2 rounded-lg hover:bg-[#8e2a63] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Prepare images array from product data
  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
      ? [product.imageUrl]
      : ["/api/placeholder/600/600"]; // Fallback placeholder

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Calculate original price for discount display (assuming 20% markup for display)
  const originalPrice = Math.round(product.price * 1.2);
  const discountPercentage = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#782355] transition-colors duration-200"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left Side - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                <img
                  src={images[currentImageIndex]}
                  alt={product.productTitle}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white transition-all duration-200"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white transition-all duration-200"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex
                        ? "border-[#782355] shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.productTitle} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <TagIcon className="h-4 w-4" />
                  <span>{product.productCategory}</span>
                  {product.brand && (
                    <>
                      <span>•</span>
                      <span>{product.brand}</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {product.productTitle}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {product.productDescription || "No description available."}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-[#782355]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      product.condition === "New"
                        ? "bg-green-500"
                        : product.condition === "Refurbished"
                        ? "bg-blue-500"
                        : product.condition === "Used"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {product.location?.address || "Not specified"}
                  </span>
                </div>
                {product.yearOfManufacture && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">
                      {product.yearOfManufacture}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Availability:</span>
                  <span
                    className={`font-medium ${
                      product.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.quantity > 0
                      ? `${product.quantity} available`
                      : "Out of stock"}
                  </span>
                </div>
                {product.deliveryAvailable && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <TruckIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium text-green-600">
                      Available{" "}
                      {product.deliveryFee > 0
                        ? `(₹${product.deliveryFee})`
                        : "(Free)"}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                      }
                      className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedQuantity(
                          Math.min(product.quantity, selectedQuantity + 1)
                        )
                      }
                      disabled={selectedQuantity >= product.quantity}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.quantity} available
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={product.quantity === 0 || addingToCart}
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-[#782355] to-[#9c3069] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#9c3069] hover:to-[#782355] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    disabled={product.quantity === 0 || isProcessingPayment}
                    onClick={handleBuyNow}
                    className="flex-1 bg-white text-[#782355] py-3 px-6 rounded-xl font-semibold border-2 border-[#782355] hover:bg-[#782355] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.quantity === 0
                      ? "Out of Stock"
                      : isProcessingPayment
                      ? "Processing..."
                      : "Buy Now"}
                  </button>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <HeartIcon
                      className={`h-6 w-6 ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="border-t border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">
                  {product.productCategory}
                </span>
              </div>
              {product.brand && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium text-gray-900">
                    {product.brand}
                  </span>
                </div>
              )}
              {product.model && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium text-gray-900">
                    {product.model}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-900">
                  {product.condition}
                </span>
              </div>
              {product.yearOfManufacture && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Year of Manufacture:</span>
                  <span className="font-medium text-gray-900">
                    {product.yearOfManufacture}
                  </span>
                </div>
              )}
              {product.color && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium text-gray-900">
                    {product.color}
                  </span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-medium text-gray-900">
                    {product.material}
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium text-gray-900">
                    {product.weight} kg
                  </span>
                </div>
              )}
              {product.dimensions &&
                (product.dimensions.length ||
                  product.dimensions.width ||
                  product.dimensions.height) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium text-gray-900">
                      {product.dimensions.length || 0} ×{" "}
                      {product.dimensions.width || 0} ×{" "}
                      {product.dimensions.height || 0} cm
                    </span>
                  </div>
                )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Original Packaging:</span>
                <span className="font-medium text-gray-900">
                  {product.originalPackaging ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Manual Included:</span>
                <span className="font-medium text-gray-900">
                  {product.manualIncluded ? "Yes" : "No"}
                </span>
              </div>
              {product.workingConditionDescription && (
                <div className="col-span-full py-2 border-b border-gray-100">
                  <span className="text-gray-600">Working Condition:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {product.workingConditionDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Recommendations */}
        <RecommendationRow
          title="Similar items you may like"
          products={similarProducts}
          loading={similarLoading}
          error={similarError}
          onProductClick={(pid) => navigate(`/product/${pid}`)}
        />

        <RecommendationRow
          title="Frequently bought together"
          products={fbtProducts}
          loading={fbtLoading}
          error={fbtError}
          onProductClick={(pid) => navigate(`/product/${pid}`)}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
