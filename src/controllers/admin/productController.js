const db = require('../../models');
const slugify = require('slugify');
const { Op } = require('sequelize');
const fs = require('fs');

// Get all products with filters
async function list(req, res) {
	try {
		const { categoryId, search, sort, limit = 12, page = 1, featured } = req.query;
		const offset = (page - 1) * limit;

		const where = {};

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
				{ model: db.ProductVariant, as: 'variants', attributes: ['id', 'name', 'price', 'stock', 'sku', 'image'] },
				{ model: db.Merchant, as: 'merchant', attributes: ['id', 'name', 'shopName', 'email', 'image'] }
			],
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
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' },
				{ model: db.Merchant, as: 'merchant', attributes: ['id', 'name', 'shopName', 'email', 'image'] }
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

// Get product by slug
async function getBySlug(req, res) {
	try {
		const product = await db.Product.findOne({
			where: { slug: req.params.slug },
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{ model: db.ProductVariant, as: 'variants' },
				{ model: db.Merchant, as: 'merchant', attributes: ['id', 'name', 'shopName', 'email', 'image'] }
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

// Create product (admin)
async function create(req, res) {
	try {
		// Extract variants from flat keys if necessary
		if (!Array.isArray(req.body.variants)) {
			req.body.variants = extractVariants(req.body);
		}

		const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, isFeatured, images, variants } = req.body;

		// Handle uploaded files (req.files is an object with upload.fields)
		const uploadedFilesMap = req.files || {};
		const uploadedFiles = Object.values(uploadedFilesMap).flat();

		const uploadedImagePaths = (uploadedFilesMap['image'] || [])
			.map(file => `/uploads/products/temp/${file.filename}`);

		// Combine uploaded images with any images from body (URLs)
		let allImages = uploadedImagePaths;
		if (images && Array.isArray(images)) {
			allImages = [...uploadedImagePaths, ...images];
		}

		const image = allImages.length > 0 ? allImages[0] : null;

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

		// Handle variants from FormData
		let parsedVariants = [];
		if (variants) {
			if (typeof variants === 'string') {
				try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
			} else if (Array.isArray(variants)) {
				parsedVariants = variants;
			}
		}

		// Validate variant SKUs don't conflict with existing products
		if (parsedVariants.length > 0) {
			for (const variant of parsedVariants) {
				if (variant.sku) {
					const existingVariant = await db.ProductVariant.findOne({ where: { sku: variant.sku } });
					if (existingVariant) {
						return res.status(400).json({
							error: 'Variant SKU already exists',
							errors: [{ path: 'variants', msg: `Variant SKU '${variant.sku}' already exists`, value: variant.sku }]
						});
					}
				}
			}
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
			images: allImages,
			slug,
			isActive: true
		});

		// Handle variant image assignments from uploaded files
		const variantImageMap = {};

		// Map uploaded variant images
		uploadedFiles.forEach(file => {
			if (file.fieldname.startsWith('variants[') && file.fieldname.endsWith('][image]')) {
				const match = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
				if (match) {
					const index = parseInt(match[1]);
					let imagePath;
					if (req.method === 'PUT') {
						// For updates, images are already in correct folder
						imagePath = `/uploads/products/${product.id}/variants/${file.filename}`;
					} else {
						// For creation, move from temp folder
						const tempPath = file.path;
						const finalDir = `public/uploads/products/${product.id}/variants`;
						const finalPath = `${finalDir}/${file.filename}`;

						if (!fs.existsSync(finalDir)) {
							fs.mkdirSync(finalDir, { recursive: true });
						}

						fs.renameSync(tempPath, finalPath);
						imagePath = `/uploads/products/${product.id}/variants/${file.filename}`;
					}
					variantImageMap[index] = imagePath;
				}
			}
		});

		// Move main product images from temp to final location
		const finalProductDir = `public/uploads/products/${product.id}`;
		if (!fs.existsSync(finalProductDir)) {
			fs.mkdirSync(finalProductDir, { recursive: true });
		}

		const finalImagePaths = [];
		uploadedFiles.forEach(file => {
			if (file.fieldname === 'image') {
				const tempPath = file.path;
				const finalPath = `${finalProductDir}/${file.filename}`;

				try {
					fs.renameSync(tempPath, finalPath);
					finalImagePaths.push(`/uploads/products/${product.id}/${file.filename}`);
				} catch (err) {
					console.error(`Failed to move image ${file.filename}:`, err);
					// Keep temp path if move fails
					finalImagePaths.push(`/uploads/products/temp/${file.filename}`);
				}
			}
		});

		// Update product with final image paths
		if (finalImagePaths.length > 0) {
			await product.update({
				image: finalImagePaths[0],
				images: finalImagePaths
			});
		}

		// Create variants if provided
		if (parsedVariants.length > 0) {
			const variantsToCreate = parsedVariants.map((variant, index) => ({
				productId: product.id,
				name: variant.name,
				price: variant.price || 0,
				stock: variant.stock || 0,
				sku: variant.sku || null,
				image: variantImageMap[index] || variant.image || null,
				attributes: variant.attributes || {}
			}));
			await db.ProductVariant.bulkCreate(variantsToCreate);
		}

		// Fetch product with variants for response
		const productWithVariants = await db.Product.findByPk(product.id, {
			include: [{ model: db.ProductVariant, as: 'variants' }]
		});

		res.status(201).json(productWithVariants);
	} catch (error) {
		console.error(error);

		// Cleanup temp images if product creation failed
		const uploadedFiles = req.files || [];
		uploadedFiles.forEach(file => {
			try {
				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
					console.log(`Cleaned up temp image: ${file.path}`);
				}
			} catch (cleanupError) {
				console.error(`Failed to cleanup temp image ${file.path}:`, cleanupError);
			}
		});

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
		// Extract variants from flat keys if necessary
		if (req.body.variants && !Array.isArray(req.body.variants)) {
			req.body.variants = extractVariants(req.body);
		}

		const product = await db.Product.findByPk(req.params.id);

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		const { title, sku, tags, dimensions, variants } = req.body;

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

		// Handle uploaded files for update (req.files is an object with upload.fields)
		const uploadedFilesMap = req.files || {};
		const allUploadedFiles = Object.values(uploadedFilesMap).flat();

		if (allUploadedFiles.length > 0) {
			const uploadedImagePaths = (uploadedFilesMap['image'] || [])
				.map(file => `/uploads/products/${product.id}/${file.filename}`);

			if (uploadedImagePaths.length > 0) {
				req.body.image = uploadedImagePaths[0]; // Set main image to first uploaded
				// For update, we'll replace the images array
				req.body.images = uploadedImagePaths;
			}
		} else {
			// Preserve existing images if no new images uploaded
			req.body.image = product.image;
			req.body.images = product.images;
		}

		// Handle variant image assignments from uploaded files
		const variantImageMap = {};
		allUploadedFiles.forEach(file => {
			if (file.fieldname.startsWith('variants[') && file.fieldname.endsWith('][image]')) {
				const match = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
				if (match) {
					const index = parseInt(match[1]);
					// For updates, images are already in correct folder
					variantImageMap[index] = `/uploads/products/${product.id}/variants/${file.filename}`;
				}
			}
		});

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

		// Handle variants from FormData
		let parsedVariants = [];
		if (variants) {
			if (typeof variants === 'string') {
				try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
			} else if (Array.isArray(variants)) {
				parsedVariants = variants;
			}
		}

		// Process variants: create new ones, update existing ones, delete removed ones
		if (parsedVariants.length > 0 || variants !== undefined) {
			// Get existing variants
			const existingVariants = await db.ProductVariant.findAll({
				where: { productId: product.id }
			});

			const existingVariantIds = existingVariants.map(v => v.id);
			const incomingVariantIds = parsedVariants
				.filter(v => v.id)
				.map(v => parseInt(v.id));

			// Delete variants that are no longer present
			const variantsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));
			if (variantsToDelete.length > 0) {
				await db.ProductVariant.destroy({
					where: { id: { [Op.in]: variantsToDelete } }
				});
			}

			// Update existing variants and create new ones
			for (let i = 0; i < parsedVariants.length; i++) {
				const variant = parsedVariants[i];
				if (variant.id) {
					// Update existing variant
					await db.ProductVariant.update({
						name: variant.name,
						price: variant.price || 0,
						stock: variant.stock || 0,
						sku: variant.sku || null,
						image: variantImageMap[i] || variant.image || null,
						attributes: variant.attributes || {}
					}, {
						where: { id: variant.id, productId: product.id }
					});
				} else {
					// Create new variant
					// Validate variant SKU doesn't conflict
					if (variant.sku) {
						const existingVariant = await db.ProductVariant.findOne({ where: { sku: variant.sku } });
						if (existingVariant) {
							return res.status(400).json({
								error: 'Variant SKU already exists',
								errors: [{ path: 'variants', msg: `Variant SKU '${variant.sku}' already exists`, value: variant.sku }]
							});
						}
					}

					await db.ProductVariant.create({
						productId: product.id,
						name: variant.name,
						price: variant.price || 0,
						stock: variant.stock || 0,
						sku: variant.sku || null,
						image: variantImageMap[i] || variant.image || null,
						attributes: variant.attributes || {}
					});
				}
			}
		}

		await product.update(req.body);

		// Fetch updated product with variants for response
		const updatedProduct = await db.Product.findByPk(product.id, {
			include: [{ model: db.ProductVariant, as: 'variants' }]
		});

		res.json(updatedProduct);
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


module.exports = { list, get, getBySlug, getFeatured, create, update, remove, bulkUpdate };
