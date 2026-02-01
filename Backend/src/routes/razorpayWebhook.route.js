const express = require("express");
const { handleRazorpayWebhook } = require("../controllers/razorpayWebhook.controller");
const router = express.Router();

// Razorpay sends raw body, so disable express.json for this route
router.post("/", express.raw({ type: "application/json" }), handleRazorpayWebhook);

module.exports = router;
