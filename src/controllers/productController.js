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
				{
					model: db.ProductVariant,
					as: 'variants',
					include: [
						{
							model: db.ProductVariantAttribute,
							as: 'variantAttributes',
							include: [
								{ model: db.Attribute, as: 'attribute' },
								{ model: db.AttributeValue, as: 'value' }
							]
						},
						{ model: db.ProductVariantImage, as: 'images' }
					]
				},
				{ model: db.ProductImage, as: 'gallery' }
			],
			order,
			limit: parseInt(limit),
			offset: parseInt(offset),
			attributes: { exclude: ['dimensions'] },
			distinct: true
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
				{
					model: db.ProductVariant,
					as: 'variants',
					include: [
						{
							model: db.ProductVariantAttribute,
							as: 'variantAttributes',
							include: [
								{ model: db.Attribute, as: 'attribute' },
								{ model: db.AttributeValue, as: 'value' }
							]
						},
						{ model: db.ProductVariantImage, as: 'images' }
					]
				},
				{ model: db.ProductImage, as: 'gallery' }
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
				{
					model: db.ProductVariant,
					as: 'variants',
					include: [
						{
							model: db.ProductVariantAttribute,
							as: 'variantAttributes',
							include: [
								{ model: db.Attribute, as: 'attribute' },
								{ model: db.AttributeValue, as: 'value' }
							]
						},
						{ model: db.ProductVariantImage, as: 'images' }
					]
				},
				{ model: db.ProductImage, as: 'gallery' }
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
	const t = await db.sequelize.transaction();
	try {
		// 1. Parse nested data if sent as JSON string (common in FormData with files)
		if (typeof req.body.productData === 'string') {
			try {
				const paramData = JSON.parse(req.body.productData);
				req.body = { ...req.body, ...paramData };
			} catch (e) {
				console.error('Failed to parse req.body.productData JSON', e);
			}
		} else if (typeof req.body.data === 'string') {
			try {
				const paramData = JSON.parse(req.body.data);
				req.body = { ...req.body, ...paramData };
			} catch (e) {
				console.error('Failed to parse req.body.data JSON', e);
			}
		}

		// 2. Map files to locations
		// Structure expectation: 
		// variants[i].image (main variant image)
		// variants[i].images (gallery) - validation might be tricky with standard multer
		// For simplicity, we assume robust frontend sending keys or we map by fieldname logic
		
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				// Correctly capture the relative path including subdirectories
				// Multer saves to 'public/uploads/...' so we want '/uploads/...'
				const path = file.path.replace(/\\/g, '/').replace(/^.*public\//, '/');
				
				// Case 1: Main Product Image
				if (file.fieldname === 'image') {
					req.body.image = path;
				}
				// Case 2: Product Gallery
				else if (file.fieldname.startsWith('gallery')) {
					if (!req.body.gallery) req.body.gallery = [];
					req.body.gallery.push({ image_path: path });
				}
				// Case 3: Variant Images/Gallery
				else {
					// Check for variant thumbnail: variants[0][image]
					const bracketMatch = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
					if (bracketMatch) {
						const index = parseInt(bracketMatch[1]);
						if (!req.body.variants) req.body.variants = [];
						if (!req.body.variants[index]) req.body.variants[index] = {};
						req.body.variants[index].thumbnail = path;
					} 
					// Check for variant gallery: variants[0][gallery]
					const galMatch = file.fieldname.match(/variants\[(\d+)\]\[gallery\]/);
					if (galMatch) {
						const index = parseInt(galMatch[1]);
						if (!req.body.variants) req.body.variants = [];
						if (!req.body.variants[index]) req.body.variants[index] = {};
						if (!req.body.variants[index].gallery) req.body.variants[index].gallery = [];
						req.body.variants[index].gallery.push(path);
					}
				}
			});
		}

		// Helper to extract/normalize variants helper 
		// (Assume req.body.variants is now an array of objects, potentially from JSON parse)
		let variantsData = req.body.variants || [];
		if (typeof variantsData === 'string') variantsData = JSON.parse(variantsData);
		logDebug(`Create: Variants Data to process: ${JSON.stringify(variantsData)}`);

		const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, isFeatured } = req.body;

		// Validate category
		if (categoryId) {
			const category = await db.Category.findByPk(categoryId);
			if (!category) throw new Error('Category not found');
		}

		// Unique SKU check
		if (sku) {
			const existing = await db.Product.findOne({ where: { sku } });
			if (existing) throw new Error('SKU already exists');
		}

		const slug = req.body.slug || slugify(title, { lower: true, strict: true });

		// 3. Create Product
		const product = await db.Product.create({
			title,
			slug,
			description,
			shortDescription,
			price,
			discountPrice,
			stock,
			sku: sku || slug,
			image: req.body.image, // Main image field
			categoryId,
			weight,
			dimensions,
			tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
			isFeatured: isFeatured === 'true' || isFeatured === true,
			isActive: true
		}, { transaction: t });

		// 4. Create Product Images (Gallery)
		if (req.body.gallery && Array.isArray(req.body.gallery)) {
			const galleryImages = req.body.gallery.map(img => ({
				product_id: product.id,
				image_path: typeof img === 'string' ? img : img.image_path,
				is_primary: false
			}));
			if (galleryImages.length > 0) {
				await db.ProductImage.bulkCreate(galleryImages, { transaction: t });
			}
		}

		// 5. Create Variants
		if (variantsData && variantsData.length > 0) {
			for (const vData of variantsData) {
				const variantValues = {
					product_id: product.id,
					sku: vData.sku,
					price: vData.price || price,
					sale_price: vData.sale_price || vData.discountPrice,
					stock: vData.stock || 0,
					thumbnail: vData.thumbnail || vData.image, // Handle both keys
					status: 'active'
				};

				const variant = await db.ProductVariant.create(variantValues, { transaction: t });

				// 5a. Variant Attributes
				if (vData.attributes && Array.isArray(vData.attributes)) {
					const variantAttrs = vData.attributes.map(attr => ({
						product_variant_id: variant.id,
						attribute_id: attr.attributeId || attr.attribute_id,
						attribute_value_id: attr.valueId || attr.attribute_value_id
					}));
					if (variantAttrs.length > 0) {
						await db.ProductVariantAttribute.bulkCreate(variantAttrs, { transaction: t });
					}
				}
				
				// 5b. Variant Images
				// If specific variant images are passed
				if (vData.images && Array.isArray(vData.images)) {
					const vImages = vData.images.map(img => ({
						product_variant_id: variant.id,
						image_path: img,
						is_primary: false
					}));
					await db.ProductVariantImage.bulkCreate(vImages, { transaction: t });
				}

				// 5c. Variant Gallery (Multer uploaded files)
				if (vData.gallery && Array.isArray(vData.gallery)) {
					const vGallery = vData.gallery.map(img => ({
						product_variant_id: variant.id,
						image_path: img,
						is_primary: false
					}));
					await db.ProductVariantImage.bulkCreate(vGallery, { transaction: t });
				}
			}
		}

		await t.commit();

		// Return fresh product
		const createdProduct = await db.Product.findByPk(product.id, {
			include: [
				{ model: db.Category, attributes: ['id', 'name', 'slug'] },
				{
					model: db.ProductVariant,
					as: 'variants',
					include: [{ model: db.ProductVariantAttribute, as: 'variantAttributes', include: ['attribute', 'value'] }]
				},
				{ model: db.ProductImage, as: 'gallery' }
			]
		});

		res.status(201).json(createdProduct);
	} catch (error) {
		await t.rollback();
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Update product (admin)
async function update(req, res) {
	const t = await db.sequelize.transaction();
	try {
		const product = await db.Product.findByPk(req.params.id);

		if (!product) {
			await t.rollback();
			return res.status(404).json({ error: 'Product not found' });
		}

		// 1. Parse nested data
		if (typeof req.body.productData === 'string') {
			try {
				const paramData = JSON.parse(req.body.productData);
				req.body = { ...req.body, ...paramData };
			} catch (e) { console.error(e); }
		} else if (typeof req.body.data === 'string') {
			try {
				const paramData = JSON.parse(req.body.data);
				req.body = { ...req.body, ...paramData };
			} catch (e) { console.error(e); }
		}

		// 2. Map files
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				const path = file.path.replace(/\\/g, '/').replace(/^.*public\//, '/');
				
				// Main Product Image
				if (file.fieldname === 'image') {
					req.body.image = path;
				}
				// Product Gallery
				else if (file.fieldname.startsWith('gallery')) {
					if (!req.body.gallery) req.body.gallery = [];
					req.body.gallery.push({ image_path: path });
				} 
				else {
					// Variant thumbnail
					const bracketMatch = file.fieldname.match(/variants\[(\d+)\]\[image\]/);
					if (bracketMatch) {
						const index = parseInt(bracketMatch[1]);
						if (!req.body.variants) req.body.variants = [];
						if (!req.body.variants[index]) req.body.variants[index] = {};
						req.body.variants[index].thumbnail = path;
					}
					// Variant gallery
					const galMatch = file.fieldname.match(/variants\[(\d+)\]\[gallery\]/);
					if (galMatch) {
						const index = parseInt(galMatch[1]);
						if (!req.body.variants) req.body.variants = [];
						if (!req.body.variants[index]) req.body.variants[index] = {};
						if (!req.body.variants[index].gallery) req.body.variants[index].gallery = [];
						req.body.variants[index].gallery.push(path);
					}
				}
			});
		}

		let variantsData = req.body.variants;
		if (typeof variantsData === 'string') variantsData = JSON.parse(variantsData);
		logDebug(`Variants Data to process: ${JSON.stringify(variantsData)}`);

		const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, isFeatured, isActive } = req.body;

		// Validation & Basic Update
		const updates = {};
		if (title) updates.title = title;
		if (description !== undefined) updates.description = description;
		if (shortDescription !== undefined) updates.shortDescription = shortDescription;
		if (price) updates.price = price;
		if (discountPrice !== undefined) updates.discountPrice = discountPrice;
		if (stock !== undefined) updates.stock = stock;
		if (sku) updates.sku = sku;
		if (categoryId) updates.categoryId = categoryId;
		if (weight) updates.weight = weight;
		if (dimensions) updates.dimensions = dimensions;
		if (tags) updates.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
		if (req.body.image) updates.image = req.body.image;
		if (isFeatured !== undefined) updates.isFeatured = isFeatured === 'true' || isFeatured === true;
		if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;

		// Slug update
		if (title && title !== product.title) {
			updates.slug = slugify(title, { lower: true, strict: true });
		}

		// SKU Unique Check
		if (sku && sku !== product.sku) {
			const existing = await db.Product.findOne({ where: { sku } });
			if (existing) throw new Error('SKU already exists');
		}

		await product.update(updates, { transaction: t });

		// 3. Update Gallery (Sync)
		const incomingGallery = req.body.gallery || [];
		const incomingPaths = incomingGallery.map(img => typeof img === 'string' ? img : img.image_path);
		
		// Delete images removed from gallery
		await db.ProductImage.destroy({
			where: {
				product_id: product.id,
				image_path: { [Op.notIn]: incomingPaths }
			},
			transaction: t
		});

		// Add only new images
		const existingImages = await db.ProductImage.findAll({ where: { product_id: product.id } });
		const existingPaths = existingImages.map(img => img.image_path);
		const newPaths = incomingPaths.filter(p => !existingPaths.includes(p));

		if (newPaths.length > 0) {
			await db.ProductImage.bulkCreate(newPaths.map(p => ({
				product_id: product.id,
				image_path: p,
				is_primary: false
			})), { transaction: t });
		}
		// Note: Deleting gallery images should probably be a separate API call or handled via explicit `deletedGalleryIds` in payload.
		// For now, we only ADD images via update.

		// 4. Update Variants
		if (variantsData && Array.isArray(variantsData)) {
			const currentVariants = await db.ProductVariant.findAll({ where: { product_id: product.id } });
			const currentIds = currentVariants.map(v => v.id);
			
			const incomingIds = variantsData.filter(v => v.id).map(v => parseInt(v.id));

			// A. Delete removed variants
			const toDelete = currentIds.filter(id => !incomingIds.includes(id));
			if (toDelete.length > 0) {
				await db.ProductVariant.destroy({ where: { id: toDelete }, transaction: t });
			}

			// B. Update or Create
			for (const vData of variantsData) {
				const variantValues = {
					sku: vData.sku,
					price: vData.price || price,
					sale_price: vData.sale_price || vData.discountPrice,
					stock: vData.stock || 0,
					status: vData.status || 'active'
				};
				if (vData.thumbnail || vData.image) {
					variantValues.thumbnail = vData.thumbnail || vData.image;
				}

				let variant;
				if (vData.id && currentIds.includes(parseInt(vData.id))) {
					variant = await db.ProductVariant.findByPk(vData.id);
					await variant.update(variantValues, { transaction: t });
				} else {
					variantValues.product_id = product.id;
					variant = await db.ProductVariant.create(variantValues, { transaction: t });
				}

				// Update Attributes (Full Replace for simplicity for each variant)
				// If attributes provided, delete old for this variant and re-add
				if (vData.attributes && Array.isArray(vData.attributes)) {
					await db.ProductVariantAttribute.destroy({ where: { product_variant_id: variant.id }, transaction: t });
					const variantAttrs = vData.attributes.map(attr => ({
						product_variant_id: variant.id,
						attribute_id: attr.attributeId || attr.attribute_id,
						attribute_value_id: attr.valueId || attr.attribute_value_id
					}));
					if (variantAttrs.length > 0) {
						await db.ProductVariantAttribute.bulkCreate(variantAttrs, { transaction: t });
					}
				}

				// Update Variant Gallery (Sync)
				const incomingVGallery = vData.gallery || [];
				const incomingVPaths = incomingVGallery.map(img => typeof img === 'string' ? img : (img.image_path || img));
				
				await db.ProductVariantImage.destroy({
					where: {
						product_variant_id: variant.id,
						image_path: { [Op.notIn]: incomingVPaths }
					},
					transaction: t
				});

				const existingVImages = await db.ProductVariantImage.findAll({ where: { product_variant_id: variant.id } });
				const existingVPaths = existingVImages.map(img => img.image_path);
				const newVPaths = incomingVPaths.filter(p => !existingVPaths.includes(p));

				if (newVPaths.length > 0) {
					await db.ProductVariantImage.bulkCreate(newVPaths.map(p => ({
						product_variant_id: variant.id,
						image_path: p,
						is_primary: false
					})), { transaction: t });
				}
			}
		}

		await t.commit();

		const updatedProduct = await db.Product.findByPk(product.id, {
			include: [
				{ model: db.ProductVariant, as: 'variants', include: ['variantAttributes'] },
				{ model: db.ProductImage, as: 'gallery' }
			]
		});
		
		res.json(updatedProduct);
	} catch (error) {
		await t.rollback();
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
