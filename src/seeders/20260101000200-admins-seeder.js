'use strict';
const bcrypt = require('bcrypt');
const { Admin } = require('../models');

module.exports = {
	async up(queryInterface, Sequelize) {
		const hashedPassword = await bcrypt.hash('admin123', 10);
		if(await Admin.findOne({ where: { email: 'admin@example.com' } })) {
			return;
		}
		await queryInterface.bulkInsert('admins', [
			{
				name: 'Admin',
				email: 'admin@example.com',
				password: hashedPassword,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('admins', null, {});
	}
};
