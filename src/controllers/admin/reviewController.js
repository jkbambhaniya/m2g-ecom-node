const db = require('../../models');
const { recalculateProductRating } = require('../productController');

// List reviews with pagination and filters
async function list(req, res) {
	try {
		const { page = 1, limit = 10, productId, userId, status, sort = 'newest' } = req.query;
		const offset = (page - 1) * limit;

		const where = {};

		if (productId) where.productId = productId;
		if (userId) where.userId = userId;
		if (status === 'approved') where.isApproved = true;
		if (status === 'pending') where.isApproved = false;

		let order = [['createdAt', 'DESC']];
		if (sort === 'oldest') order = [['createdAt', 'ASC']];
		if (sort === 'rating-high') order = [['rating', 'DESC']];
		if (sort === 'rating-low') order = [['rating', 'ASC']];

		const { count, rows } = await db.Review.findAndCountAll({
			where,
			include: [
				{
					model: db.User,
					attributes: ['id', 'name', 'email']
				},
				{
					model: db.Product,
					attributes: ['id', 'title', 'slug']
				},
				{
					model: db.Order,
					attributes: ['id', 'status', 'createdAt']
				}
			],
			order,
			limit: parseInt(limit),
			offset: parseInt(offset)
		});

		res.json({
			reviews: rows,
			pagination: {
				total: count,
				pages: Math.ceil(count / limit),
				currentPage: parseInt(page),
				perPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Approve a review
async function approveReview(req, res) {
	try {
		const { id } = req.params;

		const review = await db.Review.findByPk(id);
		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		if (review.isApproved) {
			return res.status(400).json({ error: 'Review is already approved' });
		}

		await review.update({ isApproved: true });

		// Recalculate product rating
		await recalculateProductRating(review.productId);

		res.json({ message: 'Review approved successfully', review });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Reject a review
async function rejectReview(req, res) {
	try {
		const { id } = req.params;

		const review = await db.Review.findByPk(id);
		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		if (!review.isApproved) {
			return res.status(400).json({ error: 'Review is already rejected' });
		}

		await review.update({ isApproved: false });

		// Recalculate product rating
		await recalculateProductRating(review.productId);

		res.json({ message: 'Review rejected successfully', review });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Delete a review
async function deleteReview(req, res) {
	try {
		const { id } = req.params;

		const review = await db.Review.findByPk(id);
		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
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

module.exports = { list, approveReview, rejectReview, deleteReview };
