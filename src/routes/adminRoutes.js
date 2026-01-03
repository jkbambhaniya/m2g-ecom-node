const router = require('express').Router();
const { createAdmin, loginAdmin, getProfile, updateProfile, logout } = require('../controllers/admin/authController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const productCtrl = require('../controllers/admin/productController');
const categoryCtrl = require('../controllers/admin/categoryController');
const userCtrl = require('../controllers/admin/userController');
const orderCtrl = require('../controllers/admin/orderController');
const heroCtrl = require('../controllers/admin/heroController');
const reviewCtrl = require('../controllers/admin/reviewController');
const { updateSettings, getPublicSettings } = require('../controllers/admin/settingsController');
const paymentCtrl = require('../controllers/paymentController');
const merchantCtrl = require('../controllers/admin/merchantController');
const notificationCtrl = require('../controllers/admin/notificationController');

const dashboardCtrl = require('../controllers/admin/dashboardController');
const attributeCtrl = require('../controllers/admin/attributeController');
const { productValidationRules, validate } = require('../utils/validators');
const upload = require('../utils/upload');

// Dashboard Stats Route
router.get('/dashboard/stats', authenticateAdmin, dashboardCtrl.getStats);

// Admin Authentication Routes
router.post('/create', createAdmin);
router.post('/login', loginAdmin);
router.post('/logout', authenticateAdmin, logout);
router.get('/profile', authenticateAdmin, getProfile);
router.put('/profile', authenticateAdmin, updateProfile);

// Admin Product Management Routes
router.get('/products', authenticateAdmin, productCtrl.list);
router.get('/products/featured', authenticateAdmin, productCtrl.getFeatured);
router.get('/products/slug/:slug', authenticateAdmin, productCtrl.getBySlug);
router.get('/products/:id', authenticateAdmin, productCtrl.get);
router.put('/products/bulk-update', authenticateAdmin, productCtrl.bulkUpdate);
router.post('/products', authenticateAdmin, upload.any(), productCtrl.create);
router.put('/products/:id', authenticateAdmin, upload.any(), productCtrl.update);
router.delete('/products/:id', authenticateAdmin, productCtrl.remove);

// Admin Attribute Management Routes
router.get('/attributes', authenticateAdmin, attributeCtrl.list);
router.post('/attributes', authenticateAdmin, attributeCtrl.create);
router.post('/attributes/:id/values', authenticateAdmin, attributeCtrl.addValue);

// Admin Category Management Routes
router.get('/categories', authenticateAdmin, categoryCtrl.list);
router.post('/categories', authenticateAdmin, upload.single('image'), categoryCtrl.create);
router.put('/categories/:id', authenticateAdmin, upload.single('image'), categoryCtrl.update);
router.delete('/categories/:id', authenticateAdmin, categoryCtrl.deleteCategory);

// Admin User Management Routes
router.get('/users', authenticateAdmin, userCtrl.list);
router.get('/users/:id', authenticateAdmin, userCtrl.get);

// Admin Order Management Routes
router.get('/orders', authenticateAdmin, orderCtrl.list);
router.get('/orders/:id', authenticateAdmin, orderCtrl.get);
router.patch('/orders/:id/status', authenticateAdmin, orderCtrl.updateStatus);

// Admin Merchant Management Routes
router.get('/merchants', authenticateAdmin, merchantCtrl.list);
router.get('/merchants/:id', authenticateAdmin, merchantCtrl.get);
router.patch('/merchants/:id/status', authenticateAdmin, merchantCtrl.updateStatus);
router.delete('/merchants/:id', authenticateAdmin, merchantCtrl.remove);

// Transactions
router.get('/transactions', authenticateAdmin, paymentCtrl.getAllTransactions);

// Admin Notifications
router.get('/notifications', authenticateAdmin, notificationCtrl.list);
router.post('/notifications/mark-read', authenticateAdmin, notificationCtrl.markAsRead);

// Admin Hero Management Routes
router.get('/hero', authenticateAdmin, heroCtrl.list);
router.post('/hero', authenticateAdmin, upload.single('image'), heroCtrl.create);
router.put('/hero/:id', authenticateAdmin, upload.single('image'), heroCtrl.update);
router.delete('/hero/:id', authenticateAdmin, heroCtrl.remove);
router.patch('/hero/:id/toggle', authenticateAdmin, heroCtrl.toggleStatus);

// Admin Notifications
router.get('/notifications', authenticateAdmin, notificationCtrl.list);
router.post('/notifications/mark-read', authenticateAdmin, notificationCtrl.markAsRead);
router.post('/notifications/:id/mark-read', authenticateAdmin, notificationCtrl.markOne);

// Admin Review Management Routes
router.get('/reviews', authenticateAdmin, reviewCtrl.list);
router.put('/reviews/:id/approve', authenticateAdmin, reviewCtrl.approveReview);
router.put('/reviews/:id/reject', authenticateAdmin, reviewCtrl.rejectReview);
router.delete('/reviews/:id', authenticateAdmin, reviewCtrl.deleteReview);

// Admin Settings Routes
router.put('/settings', authenticateAdmin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), updateSettings);
router.get('/settings/public', getPublicSettings);

module.exports = router;
