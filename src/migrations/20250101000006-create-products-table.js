'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('products', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			title: { type: Sequelize.STRING(255), allowNull: false },
			name: { type: Sequelize.STRING(255), allowNull: true },
			slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			description: { type: Sequelize.TEXT('long'), allowNull: true },
			shortDescription: { type: Sequelize.STRING(500), allowNull: true },
			price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
			discountPrice: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
			image: { type: Sequelize.STRING(255), allowNull: true },
			images: { type: Sequelize.TEXT('long'), allowNull: true },
			stock: { type: Sequelize.INTEGER, defaultValue: 0 },
			sku: { type: Sequelize.STRING(100), allowNull: true },
			rating: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
			ratingCount: { type: Sequelize.INTEGER, defaultValue: 0 },
			isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
			isFeatured: { type: Sequelize.BOOLEAN, defaultValue: false },
			weight: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
			dimensions: { type: Sequelize.TEXT('long'), allowNull: true },
			tags: { type: Sequelize.TEXT('long'), allowNull: true },
			categoryId: { type: Sequelize.INTEGER, allowNull: true },
			merchantId: { type: Sequelize.INTEGER, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('products', {
			fields: ['categoryId'],
			type: 'foreign key',
			name: 'fk_products_categoryId',
			references: { table: 'categories', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('products', {
			fields: ['merchantId'],
			type: 'foreign key',
			name: 'fk_products_merchantId',
			references: { table: 'merchants', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('products', 'fk_products_merchantId');
		await queryInterface.removeConstraint('products', 'fk_products_categoryId');
		await queryInterface.dropTable('products');
	},
};
