'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('wishlists', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: Sequelize.INTEGER, allowNull: false },
			productId: { type: Sequelize.INTEGER, allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('wishlists', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'fk_wishlists_userId',
			references: { table: 'users', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('wishlists', {
			fields: ['productId'],
			type: 'foreign key',
			name: 'fk_wishlists_productId',
			references: { table: 'products', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('wishlists', 'fk_wishlists_productId');
		await queryInterface.removeConstraint('wishlists', 'fk_wishlists_userId');
		await queryInterface.dropTable('wishlists');
	},
};
