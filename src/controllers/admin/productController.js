const db = require('../../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

// Get all products with filters
async function list(req, res) {
	try {
		const { categoryId, search, sort, limit = 12, page = 1, featured } = req.query;
		const offset = (page - 1) * limit;

		const where = { isActive: true };

		if (categoryId) where.categoryId = categoryId;
		if (featured === 'true') where.isFeatured = true;
		if (search) {
			where[Op.or] = [
				{ title: { [Op.like]: `%${search}%` } },
				{ description: { [Op.like]: `%${search}%` } },
				{ tags: { [Op.like]: `%${search}%` } }
			];
		}

		let order = [['createdAt', 'DESC']];
		if (sort === 'price-asc') order = [['price', 'ASC']];
		if (sort === 'price-desc') order = [['price', 'DESC']];
		if (sort === 'rating') order = [['rating', 'DESC']];
		if (sort === 'newest') order = [['createdAt', 'DESC']];

		const { count, rows } = await db.Product.findAndCountAll({
			where,
			include: [{ model: db.Category, attributes: ['id', 'name', 'slug'] }],
			order,
			limit: parseInt(limit),
			offset: parseInt(offset),
			attributes: { exclude: ['dimensions'] }
		});

		res.json({
			products: rows,
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
// Create product (admin)
async function create(req, res) {
	try {
		const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, isFeatured, images } = req.body;

		const image = req.file ? `/uploads/products/${req.file.filename}` : null;

		// Validate category exists when provided to avoid FK constraint errors
		if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
			const category = await db.Category.findByPk(categoryId);
			if (!category) {
				return res.status(400).json({
					error: 'Category not found',
					errors: [{ location: 'body', msg: 'Category not found', path: 'categoryId', value: categoryId }]
				});
			}
		}

		// Check if SKU already exists
		if (sku) {
			const existing = await db.Product.findOne({ where: { sku } });
			if (existing) {
				return res.status(400).json({
					error: 'SKU already exists',
					errors: [{ path: 'sku', msg: 'SKU already exists', value: sku }]
				});
			}
		}

		const slug = slugify(title, { lower: true, strict: true });

		// Handle FormData types (strings) for tags/dimensions if needed
		let parsedTags = tags;
		if (typeof tags === 'string') {
			try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = []; }
		}
		let parsedDimensions = dimensions;
		if (typeof dimensions === 'string') {
			try { parsedDimensions = JSON.parse(dimensions); } catch (e) { parsedDimensions = null; }
		}

		const product = await db.Product.create({
			title,
			description,
			shortDescription,
			price,
			discountPrice,
			stock,
			sku: sku || slug,
			categoryId: categoryId === '' ? null : categoryId,
			weight,
			dimensions: parsedDimensions,
			tags: Array.isArray(parsedTags) ? parsedTags : [],
			isFeatured: isFeatured === 'true' || isFeatured === true,
			image,
			images: Array.isArray(images) ? images : [],
			slug,
			isActive: true
		});

		res.status(201).json(product);
	} catch (error) {
		console.error(error);

		if (error.name === 'SequelizeUniqueConstraintError') {
			const field = error.errors[0].path;
			const value = error.errors[0].value;
			let message = `Product with this ${field} already exists`;

			if (field === 'slug') {
				message = 'Product with this title already exists';
			}

			return res.status(400).json({
				error: message,
				errors: [{ path: field, msg: message, value }]
			});
		}

		res.status(500).json({
			error: error.message,
			errors: []
		});
	}
}

// Update product (admin)
async function update(req, res) {
	try {
		const product = await db.Product.findByPk(req.params.id);

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		const { title, sku, tags, dimensions } = req.body;

		// Check if new SKU already exists
		if (sku && sku !== product.sku) {
			const existing = await db.Product.findOne({ where: { sku } });
			if (existing) {
				return res.status(400).json({ error: 'SKU already exists' });
			}
		}

		// Update slug if title changes
		if (title && title !== product.title) {
			req.body.slug = slugify(title, { lower: true, strict: true });
		}

		// Handle FormData types (strings) for tags/dimensions if needed
		if (tags && typeof tags === 'string') {
			try { req.body.tags = JSON.parse(tags); } catch (e) { }
		}
		if (dimensions && typeof dimensions === 'string') {
			try { req.body.dimensions = JSON.parse(dimensions); } catch (e) { }
		}

		if (req.file) {
			req.body.image = `/uploads/products/${req.file.filename}`;
		}

		// If categoryId is present in the update payload, ensure it exists
		if ('categoryId' in req.body) {
			const newCatId = req.body.categoryId;
			if (newCatId !== undefined && newCatId !== null && newCatId !== '') {
				const category = await db.Category.findByPk(newCatId);
				if (!category) {
					return res.status(400).json({ errors: [{ location: 'body', msg: 'Category not found', path: 'categoryId', value: newCatId }] });
				}
			}
		}

		await product.update(req.body);
		res.json(product);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Delete product (admin)
async function remove(req, res) {
	try {
		const product = await db.Product.findByPk(req.params.id);

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		await product.destroy();
		res.json({ message: 'Product deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Bulk update products status
async function bulkUpdate(req, res) {
	try {
		const { productIds, updates } = req.body;

		if (!Array.isArray(productIds) || productIds.length === 0) {
			return res.status(400).json({ error: 'Product IDs array is required' });
		}

		await db.Product.update(updates, {
			where: { id: { [db.Sequelize.Op.in]: productIds } }
		});

		res.json({ message: `${productIds.length} products updated successfully` });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}


module.exports = { list, create, update, remove, bulkUpdate };
