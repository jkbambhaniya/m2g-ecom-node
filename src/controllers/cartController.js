const db = require('../models');

async function syncCart(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
        const { items } = req.body;
        const userId = req.user.id;

        // Clear existing cart items
        await db.Cart.destroy({
            where: { userId },
            transaction
        });

        if (items && items.length > 0) {
            const cartData = items.map(item => ({
                userId,
                productId: item.productId,
                quantity: item.quantity || 1
            }));

            await db.Cart.bulkCreate(cartData, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Cart synced successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Cart sync error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getCart(req, res) {
    try {
        const userId = req.user.id;
        const cartItems = await db.Cart.findAll({
            where: { userId },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'image', 'price']
            }]
        });
        res.json(cartItems);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { syncCart, getCart };
