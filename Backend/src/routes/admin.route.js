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
} = require("../controllers/admin.controller");

// Public admin routes (no auth)
router.post("/login", adminLogin);

// Environment stats — also public so the frontend /environment page can use it
router.get("/environment/public", getEnvironmentStats);

// Protected admin routes
router.use(verifyAdminJWT);

router.post("/logout", adminLogout);
router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/products", getAdminProducts);
router.get("/orders", getAdminOrders);
router.get("/environment", getEnvironmentStats);

module.exports = router;
