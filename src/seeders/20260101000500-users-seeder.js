'use strict';
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = {
	async up(queryInterface, Sequelize) {
		const hashedUserPassword = await bcrypt.hash('user123', 10);
		const UserData = [
			{ name: 'John Doe', email: 'john@example.com', password: hashedUserPassword },
			{ name: 'Jane Smith', email: 'jane@example.com', password: hashedUserPassword }
		];
		UserData.forEach(async element => {
			if (await User.findOne({ where: { email: element.email } })) {
				return;
			}
			await queryInterface.bulkInsert('users', [
				{
					name: element.name,
					email: element.email,
					password: element.password,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			]);
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('users', null, {});
	}
};
