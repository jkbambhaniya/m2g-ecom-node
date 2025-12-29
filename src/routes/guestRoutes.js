const router = require('express').Router();
const productCtrl = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const { getPublicSettings } = require('../controllers/settingsController');
const heroCtrl = require('../controllers/admin/heroController');

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Products
router.get('/products', productCtrl.list);
router.get('/products/featured', productCtrl.getFeatured);
router.get('/products/search', productCtrl.search);
router.get('/products/category/:categoryId', productCtrl.getByCategory);
router.get('/products/slug/:slug', productCtrl.getBySlug);
router.get('/products/:id', productCtrl.get);

// Categories
router.get('/categories', categoryCtrl.list);

// Settings
router.get('/settings', getPublicSettings);

// Hero
router.get('/hero/active', heroCtrl.getActiveSlides);

module.exports = router;
