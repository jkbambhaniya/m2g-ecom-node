'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('order_items', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			orderId: { type: Sequelize.INTEGER, allowNull: false },
			productId: { type: Sequelize.INTEGER, allowNull: true },
			variantId: { type: Sequelize.INTEGER, allowNull: true },
			quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
			price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('order_items', {
			fields: ['orderId'],
			type: 'foreign key',
			name: 'fk_order_items_orderId',
			references: { table: 'orders', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('order_items', {
			fields: ['productId'],
			type: 'foreign key',
			name: 'fk_order_items_productId',
			references: { table: 'products', field: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('order_items', {
			fields: ['variantId'],
			type: 'foreign key',
			name: 'fk_order_items_variantId',
			references: { table: 'product_variants', field: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('order_items', 'fk_order_items_variantId');
		await queryInterface.removeConstraint('order_items', 'fk_order_items_productId');
		await queryInterface.removeConstraint('order_items', 'fk_order_items_orderId');
		await queryInterface.dropTable('order_items');
	},
};
