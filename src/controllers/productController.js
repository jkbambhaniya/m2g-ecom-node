const db = require('../models');
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

// Get single product
async function get(req, res) {
	try {
		const product = await db.Product.findByPk(req.params.id, {
			include: [{ model: db.Category, attributes: ['id', 'name', 'slug'] }]
		});

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		// Increment view count or similar logic can be added here
		res.json(product);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Get product by slug
async function getBySlug(req, res) {
	try {
		const product = await db.Product.findOne({
			where: { slug: req.params.slug },
			include: [{ model: db.Category, attributes: ['id', 'name', 'slug'] }]
		});

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		res.json(product);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Get featured products
async function getFeatured(req, res) {
	try {
		const limit = parseInt(req.query.limit) || 8;
		const products = await db.Product.findAll({
			where: { isFeatured: true, isActive: true },
			include: [{ model: db.Category, attributes: ['id', 'name', 'slug'] }],
			limit,
			order: [['rating', 'DESC']]
		});

		res.json(products);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Create product (admin)
async function create(req, res) {
	try {
		const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, isFeatured, images, image } = req.body;

		// Validate category exists when provided to avoid FK constraint errors
		if (categoryId !== undefined && categoryId !== null) {
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

		const product = await db.Product.create({
			title,
			description,
			shortDescription,
			price,
			discountPrice,
			stock,
			sku: sku || slug,
			categoryId,
			weight,
			dimensions,
			tags: Array.isArray(tags) ? tags : [],
			isFeatured: isFeatured || false,
			image: image || (Array.isArray(images) && images[0]) || null,
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

		const { title, sku } = req.body;

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

		// If categoryId is present in the update payload, ensure it exists
		if (req.body.hasOwnProperty('categoryId')) {
			const newCatId = req.body.categoryId;
			if (newCatId !== undefined && newCatId !== null) {
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

// Get products by category
async function getByCategory(req, res) {
	try {
		const categoryId = req.params.categoryId;
		const limit = parseInt(req.query.limit) || 12;
		const page = parseInt(req.query.page) || 1;
		const offset = (page - 1) * limit;

		const { count, rows } = await db.Product.findAndCountAll({
			where: { categoryId, isActive: true },
			include: [{ model: db.Category, attributes: ['id', 'name', 'slug'] }],
			limit,
			offset,
			order: [['createdAt', 'DESC']]
		});

		res.json({
			products: rows,
			pagination: {
				total: count,
				pages: Math.ceil(count / limit),
				currentPage: page,
				perPage: limit
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Search products
async function search(req, res) {
	try {
		const { q } = req.query;

		if (!q || q.trim().length < 2) {
			return res.json({ products: [] });
		}

		const products = await db.Product.findAll({
			where: {
				isActive: true,
				[db.Sequelize.Op.or]: [
					{ title: { [db.Sequelize.Op.like]: `%${q}%` } },
					{ description: { [db.Sequelize.Op.like]: `%${q}%` } },
					{ sku: { [db.Sequelize.Op.like]: `%${q}%` } }
				]
			},
			include: [{ model: db.Category, attributes: ['id', 'name'] }],
			limit: 10,
			attributes: { exclude: ['dimensions'] }
		});

		res.json({ products });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

module.exports = { list, get, getBySlug, getFeatured, create, update, remove, bulkUpdate, getByCategory, search };
