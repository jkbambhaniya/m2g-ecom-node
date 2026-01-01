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
		// Handle file uploads (logo, favicon) if present via multer
		if (req.files) {
			if (req.files.logo && req.files.logo[0]) {
				// multer stores file in destination with filename
				const f = req.files.logo[0];
				req.body.logoUrl = `/uploads/${f.filename}`;
			}
			if (req.files.favicon && req.files.favicon[0]) {
				const f = req.files.favicon[0];
				req.body.faviconUrl = `/uploads/${f.filename}`;
			}
		}

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
