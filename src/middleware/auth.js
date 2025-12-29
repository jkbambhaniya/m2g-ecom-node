const { verify } = require('../utils/jwt');
const db = require('../models');

async function authenticate(req, res, next) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
	const token = auth.split(' ')[1];
	try {
		const payload = verify(token);
		const user = await db.User.findByPk(payload.id);
		if (!user) return res.status(401).json({ message: 'User not found' });
		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token', error: err.message });
	}
}

module.exports = { authenticate };
