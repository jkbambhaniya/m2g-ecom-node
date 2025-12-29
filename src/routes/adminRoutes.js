const router = require('express').Router();
const { createAdmin, loginAdmin, getProfile, updateProfile, logout } = require('../controllers/admin/authController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const productCtrl = require('../controllers/admin/productController');
const categoryCtrl = require('../controllers/admin/categoryController');
const userCtrl = require('../controllers/admin/userController');
const orderCtrl = require('../controllers/admin/orderController');
const heroCtrl = require('../controllers/admin/heroController');
const { updateSettings, getPublicSettings } = require('../controllers/admin/settingsController');
const paymentCtrl = require('../controllers/paymentController');
const { productValidationRules, validate } = require('../utils/validators');
const upload = require('../utils/upload');

// ============================================
// PUBLIC ADMIN ROUTES (No Authentication)
// ============================================

// Admin Auth
router.post('/login', loginAdmin);
router.post('/create', createAdmin); // For initial setup

// ============================================
// PROTECTED ADMIN ROUTES (Authentication Required)
// ============================================

// Protected routes
router.post('/logout', authenticateAdmin, logout);
router.get('/profile', authenticateAdmin, getProfile);
router.put('/profile', authenticateAdmin, updateProfile);

// Products
router.get('/products', authenticateAdmin, productCtrl.list);
router.post('/products', authenticateAdmin, upload.single('image'), productValidationRules(), validate, productCtrl.create);
router.put('/products/:id', authenticateAdmin, upload.single('image'), productValidationRules(), validate, productCtrl.update);
router.delete('/products/:id', authenticateAdmin, productCtrl.remove);
router.patch('/products/bulk/update', authenticateAdmin, productCtrl.bulkUpdate);

// Categories
router.get('/categories', categoryCtrl.list);
router.post('/categories', authenticateAdmin, upload.single('image'), categoryCtrl.create);
router.put('/categories/:id', authenticateAdmin, upload.single('image'), categoryCtrl.update);
router.delete('/categories/:id', authenticateAdmin, categoryCtrl.deleteCategory);

// Settings
router.get('/settings', authenticateAdmin, getPublicSettings);
router.put('/settings', authenticateAdmin, updateSettings);

// Users
router.get('/users', authenticateAdmin, userCtrl.list);
router.get('/users/:id', authenticateAdmin, userCtrl.get);

// Orders
router.get('/orders', authenticateAdmin, orderCtrl.list);
router.get('/orders/:id', authenticateAdmin, orderCtrl.get);
router.patch('/orders/:id/status', authenticateAdmin, orderCtrl.updateStatus);

// Transactions
router.get('/transactions', authenticateAdmin, paymentCtrl.getAllTransactions);

// Dashboard
router.get('/dashboard', authenticateAdmin, (req, res) => {
    res.json({ message: 'Admin Dashboard Data', admin: req.admin.name });
});

// Hero Section
router.get('/hero', authenticateAdmin, heroCtrl.list);
router.post('/hero', authenticateAdmin, upload.single('image'), heroCtrl.create);
router.put('/hero/:id', authenticateAdmin, upload.single('image'), heroCtrl.update);
router.delete('/hero/:id', authenticateAdmin, heroCtrl.remove);
router.patch('/hero/:id/toggle', authenticateAdmin, heroCtrl.toggleStatus);

module.exports = router;
