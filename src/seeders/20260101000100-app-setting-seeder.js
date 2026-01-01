'use strict';
const bcrypt = require('bcrypt');
const { Admin } = require('../models');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('app_settings', [
			{
				siteName: 'My E-Commerce',
				logoUrl: 'https://example.com/logo.png',
				faviconUrl: 'https://example.com/favicon.ico',
				primaryColor: '#3b82f6',
				accentColor: '#1e40af',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('app_settings', null, {});
	}
};
