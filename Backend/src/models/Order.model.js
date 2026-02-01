const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierListing",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaterialRequest",
    },
    // Support for multiple items (cart-based orders)
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtTime: {
          type: Number,
          required: true,
          min: 0,
        },
        productSnapshot: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "liters", "pieces", "grams", "ml", "dozens", "packets"],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "Pending",
    },
    exchangeCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Product snapshot at time of order for history preservation
    productSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isReviewable: {
      type: Boolean,
      default: false,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["from-listing", "from-request", "from-cart", "single-item"],
      required: true,
    },
    deliveryAddress: {
      type: String,
    },
    pickupAddress: {
      type: String,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Payment related fields
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "wallet"],
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    // For cart-based orders
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

// Generate unique exchange code when moved to processing
OrderSchema.pre("save", async function (next) {
  if (this.status === "processing" && !this.exchangeCode) {
    this.exchangeCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Mark as reviewable when completed
  if (this.status === "completed") {
    this.isReviewable = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }

  next();
});

// Post-save middleware to update product sold count and user stats
OrderSchema.post("save", async function () {
  if (this.status === "completed" && this.wasNew === false) {
    // Update product sold count
    const SupplierListing = mongoose.model("SupplierListing");
    await SupplierListing.findByIdAndUpdate(this.listingId, {
      $inc: {
        soldCount: this.quantity,
        quantityAvailable: -this.quantity,
      },
    });

    // Update seller statistics
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(this.sellerId, {
      $inc: { ordersFulfilled: 1 },
    });
  }
});

// Check pending orders limit for seller (max 3 pending orders)
OrderSchema.statics.checkSellerPendingLimit = async function (sellerId) {
  const pendingCount = await this.countDocuments({
    sellerId: sellerId,
    status: { $in: ["pending", "confirmed", "processing", "shipped"] },
  });

  return {
    currentPending: pendingCount,
    limit: 3,
    canAcceptMore: pendingCount < 3,
    message:
      pendingCount >= 3
        ? "Seller has reached maximum pending orders limit (3). Complete existing orders first."
        : "Seller can accept more orders",
  };
};

// Get comprehensive order statistics for user
OrderSchema.statics.getUserOrderStats = async function (userId) {
  const [asBuyer, asSeller] = await Promise.all([
    this.aggregate([
      { $match: { buyerId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]),
    this.aggregate([
      { $match: { sellerId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]),
  ]);

  return { asBuyer, asSeller };
};

// Calculate total price before saving
OrderSchema.pre("save", function (next) {
  this.totalPrice = this.basePrice + this.deliveryFee;
  next();
});

// Indexes for efficient queries
OrderSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ listingId: 1, status: 1 });
OrderSchema.index({ isReviewable: 1, reviewId: 1 });
OrderSchema.index({ "items.productId": 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
