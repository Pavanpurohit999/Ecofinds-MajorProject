const express = require("express");
const router = express.Router();
const verifyAdminJWT = require("../middlewares/adminAuth.middleware");
const {
    adminLogin,
    adminLogout,
    getAdminStats,
    getAdminUsers,
    getAdminProducts,
    getAdminOrders,
    getEnvironmentStats,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    deleteProduct,
    updateOrderStatus,
} = require("../controllers/admin.controller");

// Public admin routes (no auth)
router.post("/login", adminLogin);

// Environment stats — also public so the frontend /environment page can use it
router.get("/environment/public", getEnvironmentStats);

// Protected admin routes
router.use(verifyAdminJWT);

router.post("/logout", adminLogout);
router.get("/stats", getAdminStats);

// Users
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Products
router.get("/products", getAdminProducts);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Environment
router.get("/environment", getEnvironmentStats);

module.exports = router;
