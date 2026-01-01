'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notifications', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: Sequelize.INTEGER, allowNull: true },
			merchantId: { type: Sequelize.INTEGER, allowNull: true },
			type: { type: Sequelize.STRING(255), allowNull: true },
			title: { type: Sequelize.STRING(255), allowNull: true },
			message: { type: Sequelize.TEXT('long'), allowNull: true },
			isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('notifications', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'fk_notifications_userId',
			references: { table: 'users', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		await queryInterface.addConstraint('notifications', {
			fields: ['merchantId'],
			type: 'foreign key',
			name: 'fk_notifications_merchantId',
			references: { table: 'merchants', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('notifications', 'fk_notifications_merchantId');
		await queryInterface.removeConstraint('notifications', 'fk_notifications_userId');
		await queryInterface.dropTable('notifications');
	},
};
