const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  processCartCheckout,
  createOrderFromCart
} = require('../controllers/payment.controller');
const verifyJWT = require('../middlewares/auth.middleware');

// Protected routes (authentication required)
router.use(verifyJWT); // Apply authentication middleware to all routes

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cart-checkout', processCartCheckout);
router.get('/history', getPaymentHistory);
router.post('/orders/create-from-cart', createOrderFromCart);


module.exports = router;
