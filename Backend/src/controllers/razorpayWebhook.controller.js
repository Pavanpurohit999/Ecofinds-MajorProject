const crypto = require("crypto");
const Order = require("../models/Order.model");
const User = require("../models/User.model");
const apiResponse = require("../utils/apiResponse");

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret";

    // Verify signature
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.log("⚠️ Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity || req.body.payload?.order?.entity;
    console.log("🔔 Razorpay Webhook Received:", event);

    // Handle different events
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload);
        break;

      default:
        console.log("ℹ️ Unhandled event type:", event);
    }

    res.status(200).json(new apiResponse(200, {}, "Webhook processed successfully"));
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🔹 Handle successful payment
async function handlePaymentCaptured(payment) {
  const order = await Order.findOne({ razorpayOrderId: payment.order_id });
  if (!order) return console.log("⚠️ Order not found for payment:", payment.order_id);

  order.paymentStatus = "completed";
  order.status = "confirmed";
  order.razorpayPaymentId = payment.id;
  order.paidAt = new Date();
  await order.save();

  console.log(`✅ Payment captured for Order ${order._id}`);

  // Optional: update vendor wallet or send notifications
  // const vendor = await User.findById(order.sellerId);
  // vendor.walletBalance += order.totalAmount;
  // await vendor.save();
}

// 🔹 Handle failed payment
async function handlePaymentFailed(payment) {
  const order = await Order.findOne({ razorpayOrderId: payment.order_id });
  if (!order) return;
  order.paymentStatus = "failed";
  order.status = "cancelled";
  await order.save();
  console.log(`❌ Payment failed for Order ${order._id}`);
}

// 🔹 Handle refund
async function handleRefundProcessed(refund) {
  const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
  if (!order) return;
  order.paymentStatus = "refunded";
  order.status = "refunded";
  await order.save();
  console.log(`💸 Refund processed for Order ${order._id}`);
}
