const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const reviewCtrl = require('../controllers/reviewController');

// Get reviews for a product
router.get('/product/:productId', reviewCtrl.getProductReviews);

// Create a review (authenticated users only)
router.post('/', authenticate, reviewCtrl.createReview);

// Update a review (authenticated users only, own review)
router.put('/:id', authenticate, reviewCtrl.updateReview);

// Delete a review (authenticated users only, own review)
router.delete('/:id', authenticate, reviewCtrl.deleteReview);

module.exports = router;
