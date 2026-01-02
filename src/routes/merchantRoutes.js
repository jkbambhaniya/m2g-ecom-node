const router = require('express').Router();
const { createMerchant, loginMerchant, getProfile, updateProfile } = require('../controllers/merchant/authController');
const { authenticateMerchant } = require('../middleware/merchantAuth');
const productCtrl = require('../controllers/merchant/productController');
const dashboardCtrl = require('../controllers/merchant/dashboardController');
const upload = require('../utils/upload');

// Merchant Authentication Routes
router.post('/register', createMerchant);
router.post('/login', loginMerchant);
router.get('/profile', authenticateMerchant, getProfile);
router.put('/profile', authenticateMerchant, upload.single('image'), updateProfile);

// Merchant Dashboard Routes
router.get('/dashboard/stats', authenticateMerchant, dashboardCtrl.getStats);

// Merchant Product Management Routes
router.get('/products', authenticateMerchant, productCtrl.list);
router.get('/products/:id', authenticateMerchant, productCtrl.get);
router.post('/products', authenticateMerchant, upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'variants[0][image]', maxCount: 1 },
    { name: 'variants[1][image]', maxCount: 1 },
    { name: 'variants[2][image]', maxCount: 1 }
]), productCtrl.create);
router.put('/products/:id', authenticateMerchant, upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'variants[0][image]', maxCount: 1 },
    { name: 'variants[1][image]', maxCount: 1 },
    { name: 'variants[2][image]', maxCount: 1 }
]), productCtrl.update);
router.delete('/products/:id', authenticateMerchant, productCtrl.remove);

module.exports = router;
