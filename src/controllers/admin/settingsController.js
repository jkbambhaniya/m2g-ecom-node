const { Settings } = require('../../models');

exports.getPublicSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			// Create default settings if not exists
			settings = await Settings.create({});
		}
		res.json(settings);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.updateSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			settings = await Settings.create(req.body);
		} else {
			await settings.update(req.body);
		}
		res.json(settings);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
