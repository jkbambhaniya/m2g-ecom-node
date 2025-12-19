const router = require('express').Router();
const { createAdmin, loginAdmin, getProfile, updateProfile, logout } = require('../controllers/admin/authController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const productCtrl = require('../controllers/admin/productController');
const categoryCtrl = require('../controllers/admin/categoryController');
const { updateSettings, getPublicSettings } = require('../controllers/admin/settingsController');
const { productValidationRules, validate } = require('../utils/validators');

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
router.post('/products', authenticateAdmin, productValidationRules(), validate, productCtrl.create);
router.put('/products/:id', authenticateAdmin, productValidationRules(), validate, productCtrl.update);
router.delete('/products/:id', authenticateAdmin, productCtrl.remove);
router.patch('/products/bulk/update', authenticateAdmin, productCtrl.bulkUpdate);

// Categories
router.get('/categories', categoryCtrl.list);
router.post('/categories', authenticateAdmin, categoryCtrl.create);
router.put('/categories/:id', authenticateAdmin, categoryCtrl.update);
router.delete('/categories/:id', authenticateAdmin, categoryCtrl.deleteCategory);

// Settings
router.get('/settings', authenticateAdmin, getPublicSettings);
router.put('/settings', authenticateAdmin, updateSettings);

// Dashboard
router.get('/dashboard', authenticateAdmin, (req, res) => {
    res.json({ message: 'Admin Dashboard Data', admin: req.admin.name });
});

module.exports = router;
