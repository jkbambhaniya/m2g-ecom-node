const { Admin } = require('../../models');
const { sign } = require('../../utils/jwt');

async function createAdmin(req, res) {
	const { name, email, password } = req.body;
	try {
		const admin = await Admin.create({ name, email, password });
		res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

async function loginAdmin(req, res) {
	const { email, password } = req.body;
	try {
		const admin = await Admin.findOne({ where: { email } });
		if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

		const ok = await admin.comparePassword(password);
		if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

		// Sign token with type 'admin' to distinguish from user tokens
		const token = sign({ id: admin.id, email: admin.email, type: 'admin' });
		res.json({ admin: { id: admin.id, name: admin.name, email: admin.email }, token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

async function getProfile(req, res) {
	try {
		const admin = await Admin.findByPk(req.admin.id, {
			attributes: ['id', 'name', 'email', 'createdAt']
		});
		if (!admin) return res.status(404).json({ message: 'Admin not found' });
		res.json(admin);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

async function updateProfile(req, res) {
	const { name, email, password } = req.body;
	try {
		const admin = await Admin.findByPk(req.admin.id);
		if (!admin) return res.status(404).json({ message: 'Admin not found' });

		if (name) admin.name = name;
		if (email) admin.email = email; // Note: Typically requires uniqueness check
		if (password) admin.password = password; // Will be hashed by model hooks if set up

		await admin.save();

		// Return updated user without password
		const updatedUser = admin.toJSON();
		delete updatedUser.password;

		res.json({ message: 'Profile updated successfully', admin: updatedUser });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

async function logout(req, res) {
	try {
		const token = req.user.token;
		if (!token) return res.status(401).json({ message: 'No token provided' });
		token.destroy();
		res.json({ message: 'Logged out successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}


module.exports = { createAdmin, loginAdmin, getProfile, updateProfile, logout };
