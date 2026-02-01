const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
    },
    productCategory: {
      type: String,
      required: true,
      enum: [
        "Cars",
        "Properties",
        "Mobiles",
        "Bikes",
        "Electronics & Appliances",
        "Commercial Vehicles & Spares",
        "Furniture",
        "Fashion",
        "Books, Sports & Hobbies",
        "Services",
      ],
    },
    productDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["New", "Used", "Refurbished"],
      default: "New",
    },
    yearOfManufacture: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    weight: {
      type: Number,
      min: 0,
    },
    material: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    originalPackaging: {
      type: Boolean,
      default: false,
    },
    manualIncluded: {
      type: Boolean,
      default: false,
    },
    workingConditionDescription: {
      type: String,
      trim: true,
    },
    // Image handling
    imageUrl: {
      type: String,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    imageDetails: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        format: String,
        size: Number,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    // Location information
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    // Delivery options
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Product status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Tags for better search
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Contact preferences
    contactPreferences: {
      allowMessages: { type: Boolean, default: true },
      allowCalls: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    // Enable text search
    collection: "products",
  }
);

// Indexes for better performance
ProductSchema.index({ userId: 1, isActive: 1 });
ProductSchema.index({ productCategory: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ "location.lat": 1, "location.lng": 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ productCategory: 1, price: 1 });

// Text search index
ProductSchema.index({
  productTitle: "text",
  productDescription: "text",
  brand: "text",
  model: "text",
  tags: "text",
});

// Virtual for calculating total dimensions
ProductSchema.virtual("totalDimensions").get(function () {
  if (
    this.dimensions &&
    this.dimensions.length &&
    this.dimensions.width &&
    this.dimensions.height
  ) {
    return (
      this.dimensions.length * this.dimensions.width * this.dimensions.height
    );
  }
  return null;
});

// Method to increment view count
ProductSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to check if product is available
ProductSchema.methods.isAvailable = function () {
  return this.isActive && this.quantity > 0;
};

if (!mongoose.models.Product) {
  console.log("Registering Product model for the first time");
}
module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
