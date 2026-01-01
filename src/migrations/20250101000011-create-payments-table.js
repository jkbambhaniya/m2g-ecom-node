'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('payments', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			orderId: { type: Sequelize.INTEGER, allowNull: false },
			amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
			paymentMethod: { type: Sequelize.STRING(255), allowNull: false },
			status: { type: Sequelize.STRING(255), defaultValue: 'pending' },
			transactionId: { type: Sequelize.STRING(255), allowNull: true },
			gatewayResponse: { type: Sequelize.TEXT('long'), allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('payments', {
			fields: ['orderId'],
			type: 'foreign key',
			name: 'fk_payments_orderId',
			references: { table: 'orders', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('payments', 'fk_payments_orderId');
		await queryInterface.dropTable('payments');
	},
};
