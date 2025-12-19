const db = require('../models');
const { sign } = require('../utils/jwt');

async function register(req, res) {
	const { name, email, password } = req.body;
	try {
		const user = await db.User.create({ name, email, password, roleId: 2 });
		const token = sign({ id: user.id, email: user.email });
		res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

async function login(req, res) {
	const { email, password } = req.body;
	const user = await db.User.findOne({ where: { email }, include: db.Role });
	if (!user) return res.status(400).json({ message: 'Invalid credentials' });
	const ok = await user.comparePassword(password);
	if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
	const token = sign({ id: user.id, email: user.email });
	res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.Role?.name }, token });
}

async function logout(req, res) {
	// Since we are using JWT, logout is client-side (clearing token).
	// This endpoint can be used for server-side logging or blacklist (future).
	res.json({ message: 'Logged out successfully' });
}

async function getProfile(req, res) {
	try {
		const user = await db.User.findByPk(req.user.id, {
			attributes: ['id', 'name', 'email', 'createdAt'],
			include: [{ model: db.Role, attributes: ['name'] }]
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

async function updateProfile(req, res) {
	const { name, email, password } = req.body;
	try {
		const user = await db.User.findByPk(req.user.id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		if (name) user.name = name;
		if (email) user.email = email; // Note: Typically requires uniqueness check
		if (password) user.password = password; // Will be hashed by model hooks if set up

		await user.save();

		// Return updated user without password
		const updatedUser = user.toJSON();
		delete updatedUser.password;

		res.json({ message: 'Profile updated successfully', user: updatedUser });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

module.exports = { register, login, logout, getProfile, updateProfile };
