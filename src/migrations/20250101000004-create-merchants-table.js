'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('merchants', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: Sequelize.STRING(255), allowNull: false },
			email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			password: { type: Sequelize.STRING(255), allowNull: false },
			shopName: { type: Sequelize.STRING(255), allowNull: true },
			phone: { type: Sequelize.STRING(255), allowNull: true },
			image: { type: Sequelize.STRING(255), allowNull: true },
			isActive: { type: Sequelize.BOOLEAN, defaultValue: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('merchants');
	},
};
