const db = require('../models');

// Helper function to generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function list(req, res) {
    try {
        const categories = await db.Category.findAll({
            attributes: ['id', 'name', 'slug', 'description', 'image'],
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const slug = generateSlug(name);

        // Check if slug already exists
        const existing = await db.Category.findOne({ where: { slug } });
        if (existing) {
            return res.status(400).json({ error: 'A category with this name already exists' });
        }

        const category = await db.Category.create({
            name,
            slug,
            description: description || null,
            image: image || null
        });

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Category name or slug already exists' });
        }
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { name, description, image } = req.body;

        const category = await db.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = generateSlug(name);
        }
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;

        await category.update(updateData);
        res.json(category);
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Category name or slug already exists' });
        }
        res.status(500).json({ error: error.message });
    }
}

async function deleteCategory(req, res) {
    try {
        const { id } = req.params;

        const category = await db.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if category has products
        const productCount = await db.Product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return res.status(400).json({
                error: `Cannot delete category. It has ${productCount} product(s) associated with it.`
            });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, create, update, deleteCategory };
