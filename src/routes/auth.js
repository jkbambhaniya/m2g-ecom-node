const router = require('express').Router();
const { register, login, logout, getProfile, updateProfile } = require('../controllers/authController');
const { checkout } = require('../controllers/checkoutController');
const { list: listUserOrders, get: getUserOrder } = require('../controllers/userOrderController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/checkout', authenticate, checkout);

// User Orders
router.get('/orders', authenticate, listUserOrders);
router.get('/orders/:id', authenticate, getUserOrder);

module.exports = router;
