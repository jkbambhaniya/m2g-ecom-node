const { verify } = require('../utils/jwt');
const db = require('../models');

async function authenticateAdmin(req, res, next) {
	const auth = req.headers.authorization;
	console.log(auth)
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

	const token = auth.split(' ')[1];
	try {
		const payload = verify(token);
		console.log(payload);
		// Explicitly check for admin type
		if (payload.type !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const admin = await db.Admin.findByPk(payload.id);
		if (!admin) return res.status(401).json({ message: 'Admin not found' });

		req.admin = admin;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token', error: err.message });
	}
}

module.exports = { authenticateAdmin };
