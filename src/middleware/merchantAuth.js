const { verify } = require('../utils/jwt');
const db = require('../models');

async function authenticateMerchant(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    try {
        const payload = verify(token);
        if (payload.type !== 'merchant') return res.status(403).json({ message: 'Merchant access denied' });

        const merchant = await db.Merchant.findByPk(payload.id);
        if (!merchant) return res.status(401).json({ message: 'Merchant not found' });
        if (!merchant.isActive) return res.status(403).json({ message: 'Merchant account is inactive' });

        req.merchant = merchant;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
}

module.exports = { authenticateMerchant };
