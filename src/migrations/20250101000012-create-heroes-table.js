'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('heroes', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},

			title: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},

			subtitle: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},

			image: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},

			link: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},

			position: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},

			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},

			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},

			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal(
					'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
				),
			},
		});

		// Indexes for performance
		await queryInterface.addIndex('heroes', ['isActive']);
		await queryInterface.addIndex('heroes', ['position']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('heroes');
	},
};
