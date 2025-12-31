const db = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');
const fs = require('fs');

function logDebug(message) {
	fs.appendFileSync('debug.log', new Date().toISOString() + ' - ' + message + '\n');
}

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
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' }
			],
			order,
			limit: parseInt(limit),
			offset: parseInt(offset),
			attributes: { exclude: ['dimensions'] },
			distinct: true // Important for correct count with includes
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
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' }
			]
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
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' }
			]
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
		// Handle file uploads
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				const path = `/uploads/${file.filename}`; // Assuming uploads folder
				if (file.fieldname === 'image') {
					req.body.image = path;
				} else if (file.fieldname.startsWith('variants')) {
					// Extract index: variants[0][image]
					const match = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
					if (match) {
						const index = parseInt(match[1]);
						if (!req.body.variants) req.body.variants = [];
						if (!req.body.variants[index]) req.body.variants[index] = {};
						req.body.variants[index].image = path;
					}
				}
			});
		}

		// Helper to extract variants from flat keys
		function extractVariants(body) {
			const variantsMap = {};

			// Start with existing variants array if any (populated by file upload logic)
			if (body.variants && Array.isArray(body.variants)) {
				body.variants.forEach((v, i) => {
					if (v) variantsMap[i] = { ...v };
				});
			}

			Object.keys(body).forEach(key => {
				const match = key.match(/^variants\[(\d+)\]\[(\w+)\]$/);
				if (match) {
					const index = parseInt(match[1]);
					const field = match[2];
					if (!variantsMap[index]) variantsMap[index] = {};
					variantsMap[index][field] = body[key];
				}
			});

			return Object.values(variantsMap);
		}


		req.body.variants = extractVariants(req.body);
		logDebug('DEBUG: extracted variants: ' + JSON.stringify(req.body.variants, null, 2));

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

		if (req.body.variants && Array.isArray(req.body.variants)) {
			const variants = req.body.variants.map(v => ({
				...v,
				productId: product.id
			}));
			logDebug('DEBUG: variants to create: ' + JSON.stringify(variants, null, 2));
			try {
				const createdVariants = await db.ProductVariant.bulkCreate(variants);
				logDebug('DEBUG: created variants count: ' + createdVariants.length);
			} catch (vErr) {
				logDebug('DEBUG: Variant creation error: ' + vErr.message);
			}
		}

		const createdProduct = await db.Product.findByPk(product.id, {
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' }
			]
		});


		res.status(201).json(createdProduct);
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

		// Handle file uploads
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				const path = `/uploads/${file.filename}`;
				if (file.fieldname === 'image') {
					req.body.image = path;
				} else if (file.fieldname.startsWith('variants')) {
					const match = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
					if (match) {
						const index = parseInt(match[1]);
						if (!req.body.variants) req.body.variants = [];
						// Ensure the array structure exists if it's sparse
						// Note: multer parse might have already populated req.body.variants with text fields
						// We need to strictly attach the image path
						if (req.body.variants[index]) {
							req.body.variants[index].image = path;
						}
					}
				}
			});
		}


		// Helper to extract variants from flat keys
		const variantsMap = {};
		if (req.body.variants && Array.isArray(req.body.variants)) {
			// Pre-fill with existing variants array if populated by file upload logic
			req.body.variants.forEach((v, i) => { if (v) variantsMap[i] = { ...v }; });
		}
		Object.keys(req.body).forEach(key => {
			const match = key.match(/^variants\[(\d+)\]\[(\w+)\]$/);
			if (match) {
				const index = parseInt(match[1]);
				const field = match[2];
				if (!variantsMap[index]) variantsMap[index] = {};
				variantsMap[index][field] = req.body[key];
			}
		});
		req.body.variants = Object.values(variantsMap);

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

		// Handle Variants Update
		if (req.body.variants && Array.isArray(req.body.variants)) {
			const incomVariants = req.body.variants;
			const currentVariants = await db.ProductVariant.findAll({ where: { productId: product.id } });
			const currentIds = currentVariants.map(v => v.id);

			const incomIds = incomVariants.filter(v => v.id).map(v => parseInt(v.id));

			// 1. Delete removed
			const toDelete = currentIds.filter(id => !incomIds.includes(id));
			if (toDelete.length > 0) {
				await db.ProductVariant.destroy({ where: { id: toDelete } });
			}

			// 2. Update existing and Create new
			for (const v of incomVariants) {
				if (v.id && currentIds.includes(parseInt(v.id))) {
					// Update
					await db.ProductVariant.update(v, { where: { id: v.id } });
				} else {
					// Create
					await db.ProductVariant.create({ ...v, productId: product.id });
				}
			}
		}

		res.json(await db.Product.findByPk(product.id, {
			include: [{ model: db.ProductVariant, as: 'variants' }]
		}));
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

// Recalculate product rating based on approved reviews
async function recalculateProductRating(productId) {
	try {
		const reviews = await db.Review.findAll({
			where: {
				productId,
				isApproved: true
			},
			attributes: ['rating']
		});

		if (reviews.length === 0) {
			// No approved reviews, reset rating
			await db.Product.update({
				rating: 0,
				ratingCount: 0
			}, {
				where: { id: productId }
			});
			return;
		}

		// Calculate average rating
		const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = totalRating / reviews.length;

		// Update product with new rating and count
		await db.Product.update({
			rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
			ratingCount: reviews.length
		}, {
			where: { id: productId }
		});

		console.log(`Updated product ${productId} rating to ${averageRating.toFixed(1)} based on ${reviews.length} reviews`);
	} catch (error) {
		console.error('Error recalculating product rating:', error);
		throw error;
	}
}

module.exports = { list, get, getBySlug, getFeatured, create, update, remove, bulkUpdate, getByCategory, search, recalculateProductRating };
