'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('carts', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: Sequelize.INTEGER, allowNull: false },
			productId: { type: Sequelize.INTEGER, allowNull: false },
			variantId: { type: Sequelize.INTEGER, allowNull: true },
			quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('carts', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'fk_carts_userId',
			references: { table: 'users', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('carts', {
			fields: ['productId'],
			type: 'foreign key',
			name: 'fk_carts_productId',
			references: { table: 'products', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('carts', {
			fields: ['variantId'],
			type: 'foreign key',
			name: 'fk_carts_variantId',
			references: { table: 'product_variants', field: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('carts', 'fk_carts_variantId');
		await queryInterface.removeConstraint('carts', 'fk_carts_productId');
		await queryInterface.removeConstraint('carts', 'fk_carts_userId');
		await queryInterface.dropTable('carts');
	},
};
