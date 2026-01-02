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

    // Top 5 Merchants (by delivered orders)
    const topMerchants = await db.Merchant.findAll({
        attributes: [
            'id',
            'name',
            'shopName',
            'image',
            [db.sequelize.fn('COUNT', db.sequelize.col('products.OrderItems.id')), 'deliveredOrdersCount']
        ],
        include: [{
            model: db.Product,
            as: 'products',
            attributes: [],
            include: [{
                model: db.OrderItem,
                attributes: [],
                required: true,
                include: [{
                    model: db.Order,
                    attributes: [],
                    where: { status: 'delivered' },
                    required: true
                }]
            }]
        }],
        group: ['Merchant.id', 'Merchant.name', 'Merchant.shopName', 'Merchant.image'],
        order: [[db.sequelize.literal('deliveredOrdersCount'), 'DESC']],
        limit: 5,
        subQuery: false
    });

    return {
        totalRevenue: parseFloat(totalRevenueResult),
        totalOrders,
        activeUsers,
        activeMerchants,
        onlineUsers,
        onlineMerchants,
        orderStatusDistribution: statusDistribution,
        categoryDistribution,
        topMerchants: topMerchants.map(m => ({
            id: m.id,
            name: m.name,
            shopName: m.shopName,
            image: m.image,
            deliveredOrdersCount: parseInt(m.get('deliveredOrdersCount') || 0)
        })),
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

async function calculateMerchantDashboardStats(merchantId) {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Revenue for this merchant
    const totalRevenueResult = await db.OrderItem.findOne({
        attributes: [[db.sequelize.fn('SUM', db.sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`price`')), 'total']],
        include: [{
            model: db.Product,
            where: { merchantId },
            required: true,
            attributes: []
        }],
        raw: true
    });
    const totalRevenue = totalRevenueResult?.total || 0;

    // 2. Total Orders (Unique orders containing this merchant's products)
    const totalOrdersCount = await db.OrderItem.count({
        distinct: true,
        col: 'orderId',
        include: [{
            model: db.Product,
            where: { merchantId },
            required: true,
            attributes: []
        }]
    });

    // 3. Total Products
    const totalProducts = await db.Product.count({ where: { merchantId } });

    // 4. Average Rating
    const avgRatingResult = await db.Product.findOne({
        attributes: [[db.sequelize.fn('AVG', db.sequelize.literal('rating')), 'avgRating']],
        where: { merchantId },
        raw: true
    });
    const avgRating = parseFloat(avgRatingResult?.avgRating || 0).toFixed(1);

    // 5. Daily Sales Trend (Last 14 days)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await db.OrderItem.findAll({
        attributes: [
            [db.sequelize.fn('DATE', db.sequelize.literal('`OrderItem`.`createdAt`')), 'date'],
            [db.sequelize.fn('SUM', db.sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`price`')), 'total']
        ],
        include: [{
            model: db.Product,
            where: { merchantId },
            required: true,
            attributes: []
        }],
        where: {
            createdAt: { [Op.gte]: fourteenDaysAgo }
        },
        group: [db.sequelize.literal('date')],
        order: [[db.sequelize.literal('date'), 'ASC']],
        raw: true
    });

    const dailySales = [];
    const dailyLabels = [];

    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const found = salesTrend.find(s => s.date === dateStr);
        dailySales.push(parseFloat(found ? found.total || 0 : 0));
    }

    // 6. Order Status Distribution (for orders containing merchant products)
    // 6. Order Status Distribution (for orders containing merchant products)
    const orderStatuses = await db.OrderItem.findAll({
        attributes: [
            [db.sequelize.col('Order.status'), 'status'],
            [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('OrderItem.orderId'))), 'count']
        ],
        include: [
            {
                model: db.Order,
                required: true,
                attributes: []
            },
            {
                model: db.Product,
                where: { merchantId },
                required: true,
                attributes: []
            }
        ],
        group: [db.sequelize.col('Order.status')],
        raw: true
    });

    const statusDistribution = orderStatuses.map(s => ({
        status: s.status,
        count: parseInt(s.count)
    }));

    // 7. Recent Orders (Last 5 orders)
    const recentOrders = await db.Order.findAll({
        include: [{
            model: db.OrderItem,
            as: 'items',
            required: true,
            include: [{
                model: db.Product,
                where: { merchantId },
                required: true
            }]
        }],
        limit: 5,
        subQuery: false,
        order: [['createdAt', 'DESC']]
    });

    // 8. Growth Calculations (Simplified for merchant - comparing this month vs last month revenue)
    const revenueThisMonthResult = await db.OrderItem.findOne({
        attributes: [[db.sequelize.fn('SUM', db.sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`price`')), 'total']],
        include: [{
            model: db.Product,
            where: { merchantId },
            required: true,
            attributes: []
        }],
        where: {
            createdAt: { [Op.gte]: startOfThisMonth }
        },
        raw: true
    });
    const revenueThisMonth = revenueThisMonthResult?.total || 0;

    const revenueLastMonthResult = await db.OrderItem.findOne({
        attributes: [[db.sequelize.fn('SUM', db.sequelize.literal('`OrderItem`.`quantity` * `OrderItem`.`price`')), 'total']],
        include: [{
            model: db.Product,
            where: { merchantId },
            required: true,
            attributes: []
        }],
        where: {
            createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
        },
        raw: true
    });
    const revenueLastMonth = revenueLastMonthResult?.total || 0;

    const revenueGrowth = revenueLastMonth === 0 ? 100 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

    return {
        totalRevenue: parseFloat(totalRevenue),
        totalOrders: totalOrdersCount,
        totalProducts,
        averageRating: parseFloat(avgRating),
        dailySales,
        dailyLabels,
        orderStatusDistribution: statusDistribution,
        recentOrders,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        avgDailyRevenue: parseFloat(((revenueThisMonth || 0) / (now.getDate() || 1)).toFixed(2)),
        timestamp: new Date().toISOString()
    };
}

module.exports = { calculateDashboardStats, calculateMerchantDashboardStats };
