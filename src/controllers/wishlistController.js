const db = require('../models');

async function addToWishlist(req, res) {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        // Check if already in wishlist
        const existing = await db.Wishlist.findOne({
            where: { userId, productId }
        });

        if (existing) {
            return res.status(400).json({ error: 'Product already in wishlist' });
        }

        // Add to wishlist
        await db.Wishlist.create({ userId, productId });

        res.json({ message: 'Added to wishlist successfully' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        await db.Wishlist.destroy({
            where: { userId, productId }
        });

        res.json({ message: 'Removed from wishlist successfully' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getWishlist(req, res) {
    try {
        const userId = req.user.id;

        const wishlistItems = await db.Wishlist.findAll({
            where: { userId },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'slug', 'image', 'price', 'discountPrice', 'stock']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(wishlistItems);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function syncWishlist(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
        const { items } = req.body; // items = [{ productId }]
        const userId = req.user.id;

        // Clear existing wishlist items
        await db.Wishlist.destroy({
            where: { userId },
            transaction
        });

        if (items && items.length > 0) {
            const wishlistData = items.map(item => ({
                userId,
                productId: item.productId
            }));

            await db.Wishlist.bulkCreate(wishlistData, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Wishlist synced successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Wishlist sync error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addToWishlist, removeFromWishlist, getWishlist, syncWishlist };
