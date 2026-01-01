'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('app_settings', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			siteName: { type: Sequelize.STRING(255), allowNull: true, defaultValue: 'My E-Commerce' },
			logoUrl: { type: Sequelize.STRING(255), allowNull: true },
			faviconUrl: { type: Sequelize.STRING(255), allowNull: true },
			primaryColor: { type: Sequelize.STRING(255), allowNull: true, defaultValue: '#3b82f6' },
			accentColor: { type: Sequelize.STRING(255), allowNull: true, defaultValue: '#1e40af' },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('app_settings');
	},
};
