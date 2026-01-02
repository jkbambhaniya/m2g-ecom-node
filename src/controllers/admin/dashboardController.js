const { calculateDashboardStats } = require('../../services/statsService');

async function getStats(req, res) {
    try {
        const stats = await calculateDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('ERROR GETTING DASHBOARD STATS:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getStats };
