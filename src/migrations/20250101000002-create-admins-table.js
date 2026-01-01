'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('admins', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: Sequelize.STRING(255), allowNull: false },
			email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			password: { type: Sequelize.STRING(255), allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('admins');
	},
};
