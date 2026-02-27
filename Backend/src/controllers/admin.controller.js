const Admin = require("../models/Admin.model");
const User = require("../models/User.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");
const asynchandler = require("../utils/asynchandler");
const apiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

// ──────────────────── SEEDING ────────────────────
// Auto-seed admin on first run if none exists
const seedAdminIfNeeded = async () => {
    const count = await Admin.countDocuments();
    if (count === 0) {
        const email = process.env.ADMIN_EMAIL || "admin@ecofinds.com";
        const password = process.env.ADMIN_PASSWORD || "Admin@123";
        await Admin.create({ name: "EcoFinds Admin", email, password });
        console.log(`✅ Admin seeded — email: ${email} / password: ${password}`);
    }
};
seedAdminIfNeeded().catch(console.error);

// ──────────────────── AUTH ────────────────────
const adminLogin = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new apiError(400, "Email and password are required");
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
        throw new apiError(401, "Invalid admin credentials");
    }

    const isMatch = await admin.isPasswordMatch(password);
    if (!isMatch) {
        throw new apiError(401, "Invalid admin credentials");
    }

    const accessToken = admin.generateAccessToken();

    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };

    return res
        .status(200)
        .cookie("adminAccessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, admin: { _id: admin._id, name: admin.name, email: admin.email } },
                "Admin logged in successfully"
            )
        );
});

const adminLogout = asynchandler(async (req, res) => {
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };
    return res
        .status(200)
        .clearCookie("adminAccessToken", options)
        .json(new ApiResponse(200, null, "Admin logged out successfully"));
});

// ──────────────────── OVERVIEW STATS ────────────────────
const getAdminStats = asynchandler(async (req, res) => {
    const [
        totalUsers,
        totalProducts,
        totalOrders,
        recentUsers,
        recentOrders,
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("name email username createdAt isSupplier isVendor").lean(),
        Order.find().sort({ createdAt: -1 }).limit(5).populate("buyerId", "name username").populate("productId", "productTitle").lean(),
    ]);

    // Revenue from completed orders
    const revenueAgg = await Order.aggregate([
        { $match: { status: { $in: ["completed", "delivered", "Delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentUsers,
            recentOrders,
            userGrowth,
            orderStatusBreakdown,
        }, "Admin stats fetched successfully")
    );
});

// ──────────────────── USERS ────────────────────
const getAdminUsers = asynchandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search
        ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }, { username: new RegExp(search, "i") }] }
        : {};

    const [users, total] = await Promise.all([
        User.find(query).select("-password -refresh_token -emailVerificationOTP -signinOTP").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { users, total, page, totalPages: Math.ceil(total / limit) }, "Users fetched successfully")
    );
});

// ──────────────────── PRODUCTS ────────────────────
const getAdminProducts = asynchandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const condition = req.query.condition || "";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.productTitle = new RegExp(search, "i");
    if (category) query.productCategory = category;
    if (condition) query.condition = condition;

    const [products, total] = await Promise.all([
        Product.find(query).populate("userId", "name username email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Product.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { products, total, page, totalPages: Math.ceil(total / limit) }, "Products fetched successfully")
    );
});

// ──────────────────── ORDERS ────────────────────
const getAdminOrders = asynchandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate("buyerId", "name username email")
            .populate("sellerId", "name username email")
            .populate("productId", "productTitle productCategory condition")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { orders, total, page, totalPages: Math.ceil(total / limit) }, "Orders fetched successfully")
    );
});

// ──────────────────── ENVIRONMENT STATS ────────────────────
// Average weight estimates per category (kg)
const WEIGHT_MAP = {
    "Mobiles": 0.2,
    "Electronics & Appliances": 2.0,
    "Cars": 1200,
    "Bikes": 120,
    "Commercial Vehicles & Spares": 500,
    "Furniture": 20,
    "Fashion": 0.5,
    "Books, Sports & Hobbies": 0.4,
    "Properties": 0,
    "Services": 0,
};

// CO2 saved per item (kg CO2e) — based on avoided manufacturing
const CO2_MAP = {
    "Mobiles": 70,
    "Electronics & Appliances": 200,
    "Cars": 6000,
    "Bikes": 500,
    "Commercial Vehicles & Spares": 2000,
    "Furniture": 60,
    "Fashion": 20,
    "Books, Sports & Hobbies": 5,
    "Properties": 0,
    "Services": 0,
};

const getEnvironmentStats = asynchandler(async (req, res) => {
    // Count refurbished/used PRODUCTS that have been sold (soldCount > 0)
    const refurbishedProducts = await Product.aggregate([
        {
            $match: {
                condition: { $in: ["Refurbished", "Used"] },
                soldCount: { $gt: 0 },
            },
        },
        {
            $group: {
                _id: "$productCategory",
                totalItems: { $sum: "$soldCount" },
                totalProducts: { $sum: 1 },
            },
        },
    ]);

    // Also count completed orders with refurbished/used products
    const completedOrdersWithRefurbished = await Order.aggregate([
        {
            $match: {
                status: { $in: ["completed", "delivered", "Delivered", "Confirmed"] },
                productId: { $ne: null },
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: { path: "$product", preserveNullAndEmpty: false } },
        {
            $match: {
                "product.condition": { $in: ["Refurbished", "Used"] },
            },
        },
        {
            $group: {
                _id: "$product.productCategory",
                count: { $sum: "$quantity" },
            },
        },
    ]);

    // Merge data
    const categoryMap = {};
    for (const item of refurbishedProducts) {
        categoryMap[item._id] = categoryMap[item._id] || { category: item._id, totalItems: 0 };
        categoryMap[item._id].totalItems += item.totalItems;
    }
    for (const item of completedOrdersWithRefurbished) {
        categoryMap[item._id] = categoryMap[item._id] || { category: item._id, totalItems: 0 };
        categoryMap[item._id].totalItems += item.count;
    }

    let totalWasteKg = 0;
    let totalCO2Kg = 0;
    let totalItemsSaved = 0;

    const breakdown = Object.values(categoryMap).map((entry) => {
        const wasteKg = (WEIGHT_MAP[entry.category] || 0.3) * entry.totalItems;
        const co2Kg = (CO2_MAP[entry.category] || 10) * entry.totalItems;
        totalWasteKg += wasteKg;
        totalCO2Kg += co2Kg;
        totalItemsSaved += entry.totalItems;
        return {
            category: entry.category,
            itemsSaved: entry.totalItems,
            wasteKgPrevented: Math.round(wasteKg * 100) / 100,
            co2KgSaved: Math.round(co2Kg * 100) / 100,
        };
    });

    // Totals across all products listed (even if not sold — showing platform capacity)
    const [totalListedUsed, totalListedRefurbished] = await Promise.all([
        Product.countDocuments({ condition: "Used" }),
        Product.countDocuments({ condition: "Refurbished" }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            summary: {
                totalItemsSaved,
                totalWasteKgPrevented: Math.round(totalWasteKg * 100) / 100,
                totalCO2KgSaved: Math.round(totalCO2Kg * 100) / 100,
                totalListedUsed,
                totalListedRefurbished,
                totalEcoListings: totalListedUsed + totalListedRefurbished,
            },
            breakdown,
        }, "Environment stats fetched successfully")
    );
});

module.exports = {
    adminLogin,
    adminLogout,
    getAdminStats,
    getAdminUsers,
    getAdminProducts,
    getAdminOrders,
    getEnvironmentStats,
};
