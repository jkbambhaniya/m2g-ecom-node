const db = require('../models');
const { sign } = require('../utils/jwt');
const fs = require('fs');
const path = require('path');

function debugLog(msg) {
	const logPath = path.join(process.cwd(), 'debug.log');
	const timestamp = new Date().toISOString();
	fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
	console.log(`[DEBUG] ${msg}`);
}

async function register(req, res) {
	const { name, email, password } = req.body;
	try {
		debugLog(`📝 Registering user: ${email}`);
		const user = await db.User.create({ name, email, password });
		const token = sign({ id: user.id, email: user.email });

		// Broadcast updated stats to admin dashboard
		if (req.broadcastDashboardStats) {
			debugLog(`📡 Broadcasting stats after user registration SUCCESS for: ${user.email}`);
			req.broadcastDashboardStats();
		} else {
			debugLog(`❌ req.broadcastDashboardStats is MISSING in register controller!`);
		}

		res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
	} catch (err) {
		debugLog(`❌ Registration error: ${err.message}`);
		res.status(400).json({ error: err.message });
	}
}

async function login(req, res) {
	const { email, password } = req.body;
	const user = await db.User.findOne({ where: { email } });
	if (!user) return res.status(400).json({ message: 'Invalid credentials' });
	const ok = await user.comparePassword(password);
	if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
	const token = sign({ id: user.id, email: user.email });
	res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
}

async function logout(req, res) {
	// Since we are using JWT, logout is client-side (clearing token).
	// This endpoint can be used for server-side logging or blacklist (future).
	res.json({ message: 'Logged out successfully' });
}

async function getProfile(req, res) {
	try {
		const user = await db.User.findByPk(req.user.id, {
			attributes: ['id', 'name', 'email', 'createdAt']
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
