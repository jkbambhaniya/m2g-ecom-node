const db = require('../models');
const { recalculateProductRating } = require('./productController');

// Get approved reviews for a product
async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await db.Review.findAndCountAll({
            where: {
                productId,
                isApproved: true
            },
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            reviews: rows,
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// Create a new review
async function createReview(req, res) {
    try {
        const { productId, rating, comment, orderId } = req.body;
        const userId = req.user.id;

        if (!productId || !rating) {
            return res.status(400).json({ error: 'Product ID and rating are required' });
        }

        // Check if user already reviewed this product for THIS specific order
        const checkWhere = { userId, productId };
        if (orderId) {
            checkWhere.orderId = orderId;
        }

        const existing = await db.Review.findOne({
            where: checkWhere
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this product for this order' });
        }

        const review = await db.Review.create({
            userId,
            productId,
            orderId,
            rating,
            comment,
            isApproved: false // Set to false by default, requires admin approval
        });

        res.status(201).json({ message: 'Review submitted successfully and is awaiting approval', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// Update a review
async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const review = await db.Review.findOne({
            where: { id, userId }
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }

        const wasApproved = review.isApproved;

        await review.update({
            rating: rating || review.rating,
            comment: comment !== undefined ? comment : review.comment,
            isApproved: false // Re-approval required after update
        });

        // If it was already approved, we need to recalculate since we changed rating and set it to pending
        if (wasApproved) {
            await recalculateProductRating(review.productId);
        }

        res.json({ message: 'Review updated successfully and is awaiting re-approval', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// Delete a review
async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await db.Review.findOne({
            where: { id, userId }
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }

        const productId = review.productId;
        const wasApproved = review.isApproved;

        await review.destroy();

        // If review was approved, recalculate product rating
        if (wasApproved) {
            await recalculateProductRating(productId);
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview
};
