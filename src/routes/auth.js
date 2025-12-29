const router = require('express').Router();
const { register, login, logout, getProfile, updateProfile } = require('../controllers/authController');
const { checkout } = require('../controllers/checkoutController');
const { list: listUserOrders, get: getUserOrder } = require('../controllers/userOrderController');
const { syncCart, getCart } = require('../controllers/cartController');
const { addToWishlist, removeFromWishlist, getWishlist, syncWishlist } = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/checkout', authenticate, checkout);

// Cart
router.get('/cart', authenticate, getCart);
router.post('/cart/sync', authenticate, syncCart);

// Wishlist
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/add', authenticate, addToWishlist);
router.delete('/wishlist/:productId', authenticate, removeFromWishlist);
router.post('/wishlist/sync', authenticate, syncWishlist);

// User Orders
router.get('/orders', authenticate, listUserOrders);
router.get('/orders/:id', authenticate, getUserOrder);

// Payment
const { createOrder, verifyPayment } = require('../controllers/paymentController');
router.post('/payment/create-order', authenticate, createOrder);
router.post('/payment/verify', authenticate, verifyPayment);

module.exports = router;
