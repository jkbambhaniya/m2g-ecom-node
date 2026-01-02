const db = require('../models');
const { Op } = require('sequelize');

async function calculateDashboardStats() {
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

    // Active Merchants
    const activeMerchants = await db.Merchant.count();

    console.log('DEBUG DASHBOARD STATS:', {
        totalRevenueResult,
        totalOrders,
        activeUsers,
        activeMerchants
    });

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
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        orderGrowth: parseFloat(orderGrowth.toFixed(2)),
        userGrowth: parseFloat(userGrowth.toFixed(2)),
        merchantGrowth: parseFloat(merchantGrowth.toFixed(2)),
        timestamp: new Date().toISOString()
    };
}

module.exports = { calculateDashboardStats };
