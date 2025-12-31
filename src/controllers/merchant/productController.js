const db = require('../../models');
const slugify = require('slugify');
const { Op } = require('sequelize');
const fs = require('fs');

// Get all products for the logged-in merchant
async function list(req, res) {
    try {
        const { categoryId, search, sort, limit = 12, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const where = { merchantId: req.merchant.id };

        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        let order = [['createdAt', 'DESC']];
        if (sort === 'price-asc') order = [['price', 'ASC']];
        if (sort === 'price-desc') order = [['price', 'DESC']];

        const { count, rows } = await db.Product.findAndCountAll({
            where,
            include: [
                { model: db.Category, attributes: ['id', 'name', 'slug'] },
                { model: db.ProductVariant, as: 'variants' }
            ],
            order,
            limit: parseInt(limit),
            offset: parseInt(offset)
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

// Get single product (must belong to merchant)
async function get(req, res) {
    try {
        const product = await db.Product.findOne({
            where: { id: req.params.id, merchantId: req.merchant.id },
            include: [
                { model: db.Category, attributes: ['id', 'name', 'slug'] },
                { model: db.ProductVariant, as: 'variants' }
            ]
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or access denied' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Helper to extract variants
function extractVariants(body) {
    const variantsMap = {};
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

// Create product
async function create(req, res) {
    try {
        // Extract variants from flat keys if necessary
        if (!Array.isArray(req.body.variants)) {
            req.body.variants = extractVariants(req.body);
        }

        const { title, description, shortDescription, price, discountPrice, stock, sku, categoryId, weight, dimensions, tags, variants } = req.body;
        const merchantId = req.merchant.id;

        // Handle uploaded files (req.files is an object with upload.fields)
        const uploadedFilesMap = req.files || {};
        const allUploadedFiles = Object.values(uploadedFilesMap).flat();

        const uploadedImagePaths = (uploadedFilesMap['image'] || [])
            .map(file => `/uploads/products/temp/${file.filename}`);

        const slug = slugify(title, { lower: true, strict: true });

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
            categoryId: categoryId || null,
            merchantId,
            weight,
            dimensions: parsedDimensions,
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            image: uploadedImagePaths[0] || null,
            images: uploadedImagePaths,
            slug,
            isActive: true
        });

        // Move files from temp to product folder
        const finalProductDir = `public/uploads/products/${product.id}`;
        if (!fs.existsSync(finalProductDir)) {
            fs.mkdirSync(finalProductDir, { recursive: true });
        }

        const finalImagePaths = [];
        allUploadedFiles.forEach(file => {
            if (file.fieldname === 'image') {
                const finalPath = `${finalProductDir}/${file.filename}`;
                if (fs.existsSync(file.path)) {
                    fs.renameSync(file.path, finalPath);
                    finalImagePaths.push(`/uploads/products/${product.id}/${file.filename}`);
                }
            }
        });

        if (finalImagePaths.length > 0) {
            await product.update({ image: finalImagePaths[0], images: finalImagePaths });
        }

        // Handle variants and their images
        let parsedVariants = Array.isArray(variants) ? variants : [];
        if (typeof variants === 'string') {
            try { parsedVariants = JSON.parse(variants); } catch (e) { }
        }

        if (parsedVariants.length > 0) {
            const variantCreationPromises = parsedVariants.map(async (v, i) => {
                let variantImage = null;
                const variantFileField = `variants[${i}][image]`;
                const variantFiles = uploadedFilesMap[variantFileField];

                if (variantFiles && variantFiles.length > 0) {
                    const file = variantFiles[0];
                    const variantDir = `${finalProductDir}/variants`;
                    if (!fs.existsSync(variantDir)) fs.mkdirSync(variantDir, { recursive: true });

                    const finalPath = `${variantDir}/${file.filename}`;
                    if (fs.existsSync(file.path)) {
                        fs.renameSync(file.path, finalPath);
                        variantImage = `/uploads/products/${product.id}/variants/${file.filename}`;
                    }
                }

                return {
                    productId: product.id,
                    name: v.name,
                    price: v.price || product.price,
                    stock: v.stock || 0,
                    sku: v.sku || `${product.sku}-${i}`,
                    image: variantImage,
                    attributes: v.attributes || {}
                };
            });

            const variantsToCreate = await Promise.all(variantCreationPromises);
            await db.ProductVariant.bulkCreate(variantsToCreate);
        }

        res.status(201).json(product);
    } catch (error) {
        console.error('Merchant Product Create Error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update product
async function update(req, res) {
    try {
        const product = await db.Product.findOne({
            where: { id: req.params.id, merchantId: req.merchant.id }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Extract variants from flat keys if necessary
        if (req.body.variants && !Array.isArray(req.body.variants)) {
            req.body.variants = extractVariants(req.body);
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

        // Handle uploaded files (req.files is an object with upload.fields)
        const uploadedFilesMap = req.files || {};
        const allUploadedFiles = Object.values(uploadedFilesMap).flat();

        if (allUploadedFiles.length > 0) {
            const uploadedImagePaths = (uploadedFilesMap['image'] || [])
                .map(file => `/uploads/products/${product.id}/${file.filename}`);

            if (uploadedImagePaths.length > 0) {
                req.body.image = uploadedImagePaths[0];
                req.body.images = uploadedImagePaths;
            }
        }

        // Handle variants from FormData
        let parsedVariants = Array.isArray(variants) ? variants : [];
        if (typeof variants === 'string') {
            try { parsedVariants = JSON.parse(variants); } catch (e) { }
        }

        // Process variants: create new ones, update existing ones, delete removed ones
        if (parsedVariants.length > 0 || variants !== undefined) {
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
                // Assuming `Op` is imported from sequelize, e.g., `const { Op } = require('sequelize');`
                await db.ProductVariant.destroy({
                    where: { id: { [Op.in]: variantsToDelete } }
                });
            }

            // Update existing variants and create new ones
            for (let i = 0; i < parsedVariants.length; i++) {
                const variant = parsedVariants[i];
                let variantImage = null;
                const variantFileField = `variants[${i}][image]`;
                const variantFiles = uploadedFilesMap[variantFileField];

                if (variantFiles && variantFiles.length > 0) {
                    const file = variantFiles[0];
                    variantImage = `/uploads/products/${product.id}/variants/${file.filename}`;
                }

                if (variant.id) {
                    // Update existing
                    await db.ProductVariant.update({
                        name: variant.name,
                        price: variant.price || req.body.price || product.price,
                        stock: variant.stock || 0,
                        sku: variant.sku || null,
                        image: variantImage || variant.image || null,
                        attributes: variant.attributes || {}
                    }, {
                        where: { id: variant.id, productId: product.id }
                    });
                } else {
                    // Create new
                    await db.ProductVariant.create({
                        productId: product.id,
                        name: variant.name,
                        price: variant.price || req.body.price || product.price,
                        stock: variant.stock || 0,
                        sku: variant.sku || `${sku || product.sku}-${i}`,
                        image: variantImage || null,
                        attributes: variant.attributes || {}
                    });
                }
            }
        }

        await product.update(req.body);

        const updatedProduct = await db.Product.findOne({
            where: { id: product.id },
            include: [{ model: db.ProductVariant, as: 'variants' }]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Merchant Product Update Error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete product
async function remove(req, res) {
    try {
        const result = await db.Product.destroy({
            where: { id: req.params.id, merchantId: req.merchant.id }
        });

        if (!result) {
            return res.status(404).json({ error: 'Product not found or access denied' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, get, create, update, remove };
