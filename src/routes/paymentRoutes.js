const router = require('express').Router();
const { getTransactionHistory } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.get('/history', authenticate, getTransactionHistory);

module.exports = router;
