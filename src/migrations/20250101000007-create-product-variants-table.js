'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('product_variants', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			productId: { type: Sequelize.INTEGER, allowNull: false },
			name: { type: Sequelize.STRING(255), allowNull: false },
			price: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.00 },
			stock: { type: Sequelize.INTEGER, defaultValue: 0 },
			sku: { type: Sequelize.STRING(100), allowNull: true },
			image: { type: Sequelize.STRING(255), allowNull: true },
			attributes: { type: Sequelize.JSON, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('product_variants', {
			fields: ['productId'],
			type: 'foreign key',
			name: 'fk_product_variants_productId',
			references: { table: 'products', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('product_variants', 'fk_product_variants_productId');
		await queryInterface.dropTable('product_variants');
	},
};
