const express = require("express");
const router = express.Router();
const {
    toggleWishlist,
    getWishlist,
    checkWishlistStatus
} = require("../controllers/wishlist.controller");
const auth = require("../middlewares/auth.middleware");

// Protect all routes
router.use(auth);

router.get("/", getWishlist);
router.post("/toggle/:productId", toggleWishlist);
router.get("/status/:productId", checkWishlistStatus);

module.exports = router;
