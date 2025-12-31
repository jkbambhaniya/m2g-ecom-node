const db = require('../models');

// Get all orders for the authenticated user
async function list(req, res) {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const where = { userId };
        if (status) {
            where.status = status;
        }

        const orders = await db.Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: db.OrderItem,
                    as: 'items',
                    attributes: ['id', 'quantity', 'price'],
                    include: [
                        {
                            model: db.Product,
                            attributes: ['id', 'title', 'image'],
                            include: [{
                                model: db.Review,
                                as: 'reviews',
                                where: { userId },
                                required: false
                            }]
                        }
                    ]
                }
            ]
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// Get specific order details for the user
async function get(req, res) {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await db.Order.findOne({
            where: { id: orderId, userId },
            include: [
                {
                    model: db.OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: db.Product,
                            attributes: ['id', 'title', 'image', 'price'],
                            include: [{
                                model: db.Review,
                                as: 'reviews',
                                where: { userId },
                                required: false
                            }]
                        }
                    ]
                },
                {
                    model: db.Payment,
                    as: 'payments'
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, get };
