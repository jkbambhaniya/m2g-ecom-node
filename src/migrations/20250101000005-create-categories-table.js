'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('categories', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			image: { type: Sequelize.STRING(255), allowNull: true },
			description: { type: Sequelize.TEXT, allowNull: true },
			parent_id: { type: Sequelize.INTEGER, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('categories', {
			fields: ['parent_id'],
			type: 'foreign key',
			name: 'fk_categories_parent_id',
			references: { table: 'categories', field: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('categories', 'fk_categories_parent_id');
		await queryInterface.dropTable('categories');
	},
};
