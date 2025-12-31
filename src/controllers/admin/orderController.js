const db = require('../../models');
const { Op } = require('sequelize');

// Get all orders
async function list(req, res) {
    try {
        const { search, status, limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) {
            where.status = status;
        }

        const include = [
            {
                model: db.User,
                attributes: ['id', 'name', 'email']
            }
        ];

        // If search is provided, we search by User name or email
        if (search) {
            include[0].where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.Order.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            orders: rows,
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

// Get order details
async function get(req, res) {
    try {
        const order = await db.Order.findByPk(req.params.id, {
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: db.OrderItem,
                    as: 'items',
                    include: [{
                        model: db.Product,
                        attributes: ['id', 'title', 'image', 'price'],
                        include: [{
                            model: db.Review,
                            as: 'reviews'
                        }]
                    }]
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

// Update order status
async function updateStatus(req, res) {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const order = await db.Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, get, updateStatus };
