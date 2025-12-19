module.exports = (sequelize, DataTypes) => {
	const Settings = sequelize.define('Settings', {
		siteName: {
			type: DataTypes.STRING,
			defaultValue: 'My E-Commerce'
		},
		logoUrl: {
			type: DataTypes.STRING,
			allowNull: true
		},
		faviconUrl: {
			type: DataTypes.STRING,
			allowNull: true
		},
		primaryColor: {
			type: DataTypes.STRING,
			defaultValue: '#3b82f6' // Default blue-500
		},
		accentColor: {
			type: DataTypes.STRING,
			defaultValue: '#1e40af' // Default blue-800
		}
	}, {
		timestamps: true
	});

	return Settings;
};
