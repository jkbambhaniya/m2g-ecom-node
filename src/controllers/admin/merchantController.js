const db = require('../../models');
const { Op } = require('sequelize');

async function list(req, res) {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { shopName: { [Op.like]: `%${search}%` } }
            ];
        }
        if (status === 'active') where.isActive = true;
        if (status === 'inactive') where.isActive = false;

        const { count, rows } = await db.Merchant.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            merchants: rows,
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

async function get(req, res) {
    try {
        const merchant = await db.Merchant.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Product,
                    as: 'products',
                    attributes: ['id', 'title', 'price', 'stock', 'isActive', 'image']
                }
            ]
        });

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        res.json(merchant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function updateStatus(req, res) {
    try {
        const { isActive } = req.body;
        const merchant = await db.Merchant.findByPk(req.params.id);

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        await merchant.update({ isActive });

        // Broadcast updated stats to dashboard
        const broadcastDashboardStats = req.app.locals.broadcastDashboardStats;
        if (broadcastDashboardStats) {
            broadcastDashboardStats();
        }

        res.json({ message: 'Merchant status updated', merchant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function remove(req, res) {
    try {
        const merchant = await db.Merchant.findByPk(req.params.id);

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        // Optional: Check if merchant has orders/products before deleting or just soft delete
        await merchant.destroy();
        res.json({ message: 'Merchant deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, get, updateStatus, remove };
