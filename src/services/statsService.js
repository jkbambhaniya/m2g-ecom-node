const db = require('../models');
const { Op } = require('sequelize');

async function calculateDashboardStats(onlineUsers = 0, onlineMerchants = 0) {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Revenue (broadened for visibility)
    const totalRevenueResult = await db.Order.sum('total') || 0;

    // Total Orders
    const totalOrders = await db.Order.count();

    // Active Users
    const activeUsers = await db.User.count();

    // Daily Sales Trend (Last 14 days)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await db.Order.findAll({
        attributes: [
            [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
            [db.sequelize.fn('SUM', db.sequelize.col('total')), 'total']
        ],
        where: {
            status: { [Op.ne]: 'cancelled' },
            createdAt: { [Op.gte]: fourteenDaysAgo }
        },
        group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
        order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']]
    });

    const dailySales = [];
    const dailyLabels = [];

    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const found = salesTrend.find(s => s.get('date') === dateStr);
        dailySales.push(parseFloat(found ? found.get('total') || 0 : 0));
    }

    // Active Merchants
    const activeMerchants = await db.Merchant.count();

    // Order Status Distribution
    const orderStatuses = await db.Order.findAll({
        attributes: [
            'status',
            [db.sequelize.fn('count', db.sequelize.col('id')), 'count']
        ],
        group: ['status']
    });

    const statusDistribution = orderStatuses.map(s => ({
        status: s.status,
        count: parseInt(s.get('count'))
    }));

    // Category Sales Distribution
    const categorySales = await db.OrderItem.findAll({
        attributes: [
            [db.sequelize.col('Product.Category.name'), 'categoryName'],
            [db.sequelize.fn('SUM', db.sequelize.literal('OrderItem.quantity * OrderItem.price')), 'totalSales']
        ],
        include: [{
            model: db.Product,
            attributes: [],
            include: [{
                model: db.Category,
                attributes: []
            }]
        }],
        group: ['Product.Category.name'],
        raw: true
    });

    const categoryDistribution = categorySales.map(c => ({
        name: c.categoryName || 'Uncategorized',
        value: parseFloat(c.totalSales || 0)
    }));

    // Quick Stats Calculations
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const deliveredThisWeek = await db.Order.count({
        where: {
            status: 'delivered',
            createdAt: { [Op.gte]: startOfWeek }
        }
    });

    const pendingCount = statusDistribution.find(s => s.status.toLowerCase() === 'pending')?.count || 0;

    // Growth calculations
    const revenueThisMonth = await db.Order.sum('total', {
        where: {
            createdAt: { [Op.gte]: startOfThisMonth }
        }
    }) || 0;

    const revenueLastMonth = await db.Order.sum('total', {
        where: {
            createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
        }
    }) || 0;

    const revenueGrowth = revenueLastMonth === 0 ? 100 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

    const ordersThisMonth = await db.Order.count({
        where: { createdAt: { [Op.gte]: startOfThisMonth } }
    });
    const ordersLastMonth = await db.Order.count({
        where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } }
    });
    const orderGrowth = ordersLastMonth === 0 ? 100 : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

    const usersThisMonth = await db.User.count({
        where: { createdAt: { [Op.gte]: startOfThisMonth } }
    });
    const usersLastMonth = await db.User.count({
        where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } }
    });
    const userGrowth = usersLastMonth === 0 ? 100 : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

    const merchantsThisMonth = await db.Merchant.count({
        where: { createdAt: { [Op.gte]: startOfThisMonth } }
    });
    const merchantsLastMonth = await db.Merchant.count({
        where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } }
    });
    const merchantGrowth = merchantsLastMonth === 0 ? 100 : ((merchantsThisMonth - merchantsLastMonth) / merchantsLastMonth) * 100;

    return {
        totalRevenue: parseFloat(totalRevenueResult),
        totalOrders,
        activeUsers,
        activeMerchants,
        onlineUsers,
        onlineMerchants,
        orderStatusDistribution: statusDistribution,
        categoryDistribution,
        deliveredThisWeek,
        pendingCount,
        dailySales,
        dailyLabels,
        avgDailyRevenue: parseFloat(((revenueThisMonth || 0) / (now.getDate() || 1)).toFixed(2)),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        orderGrowth: parseFloat(orderGrowth.toFixed(2)),
        userGrowth: parseFloat(userGrowth.toFixed(2)),
        merchantGrowth: parseFloat(merchantGrowth.toFixed(2)),
        timestamp: new Date().toISOString()
    };
}

module.exports = { calculateDashboardStats };
