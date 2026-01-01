'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('reviews', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: Sequelize.INTEGER, allowNull: false },
			productId: { type: Sequelize.INTEGER, allowNull: false },
			orderId: { type: Sequelize.INTEGER, allowNull: true },
			rating: { type: Sequelize.TINYINT, allowNull: false },
			comment: { type: Sequelize.TEXT('long'), allowNull: true },
			isApproved: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('reviews', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'fk_reviews_userId',
			references: { table: 'users', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('reviews', {
			fields: ['productId'],
			type: 'foreign key',
			name: 'fk_reviews_productId',
			references: { table: 'products', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('reviews', {
			fields: ['orderId'],
			type: 'foreign key',
			name: 'fk_reviews_orderId',
			references: { table: 'orders', field: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('reviews', 'fk_reviews_orderId');
		await queryInterface.removeConstraint('reviews', 'fk_reviews_productId');
		await queryInterface.removeConstraint('reviews', 'fk_reviews_userId');
		await queryInterface.dropTable('reviews');
	},
};
