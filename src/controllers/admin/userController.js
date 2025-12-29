const db = require('../../models');
const { Op } = require('sequelize');

// Get all users
async function list(req, res) {
    try {
        const { search, limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await db.User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] }
        });

        res.json({
            users: rows,
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

// Get user details with orders and cart items
async function get(req, res) {
    try {
        const user = await db.User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Order,
                    as: 'orders',
                    include: [
                        {
                            model: db.OrderItem,
                            as: 'items',
                            include: [{ model: db.Product, attributes: ['id', 'title', 'image', 'price'] }]
                        }
                    ]
                },
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    include: [{ model: db.Product, attributes: ['id', 'title', 'image', 'price'] }]
                }
            ],
            order: [
                [{ model: db.Order, as: 'orders' }, 'createdAt', 'DESC']
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, get };
