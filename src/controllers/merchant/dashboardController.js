const { calculateMerchantDashboardStats } = require('../../services/statsService');

async function getStats(req, res) {
    try {
        const merchantId = req.merchant.id;
        const stats = await calculateMerchantDashboardStats(merchantId);
        res.json(stats);
    } catch (error) {
        console.error('ERROR GETTING MERCHANT DASHBOARD STATS:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getStats };
