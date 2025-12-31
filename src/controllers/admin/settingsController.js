const { Settings } = require('../../models');

exports.getPublicSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			// Create default settings if not exists
			settings = await Settings.create({
				siteName: 'M2G Ecom',
				primaryColor: '#3b82f6',
				accentColor: '#1e40af'
			});
		}
		res.json(settings);
	} catch (err) {
		console.error('Settings fetch error:', err);
		res.status(500).json({ message: err.message });
	}
};

exports.updateSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			settings = await Settings.create({
				siteName: req.body.siteName || 'M2G Ecom',
				logoUrl: req.body.logoUrl,
				faviconUrl: req.body.faviconUrl,
				primaryColor: req.body.primaryColor || '#3b82f6',
				accentColor: req.body.accentColor || '#1e40af'
			});
		} else {
			await settings.update(req.body);
		}
		res.json(settings);
	} catch (err) {
		console.error('Settings update error:', err);
		res.status(500).json({ message: err.message });
	}
};
