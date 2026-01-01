'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('orders', {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: Sequelize.INTEGER, allowNull: true },
			total: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
			status: { type: Sequelize.STRING(255), defaultValue: 'pending' },
			paymentMethod: { type: Sequelize.STRING(255), defaultValue: 'COD' },
			paymentStatus: { type: Sequelize.STRING(255), defaultValue: 'pending' },
			transactionId: { type: Sequelize.STRING(255), allowNull: true },
			billingAddress: { type: Sequelize.TEXT('long'), allowNull: true },
			shippingAddress: { type: Sequelize.TEXT('long'), allowNull: true },
			razorpayOrderId: { type: Sequelize.STRING(255), allowNull: true },
			razorpayPaymentId: { type: Sequelize.STRING(255), allowNull: true },
			razorpaySignature: { type: Sequelize.STRING(255), allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
			updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
		});

		await queryInterface.addConstraint('orders', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'fk_orders_userId',
			references: { table: 'users', field: 'id' },
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeConstraint('orders', 'fk_orders_userId');
		await queryInterface.dropTable('orders');
	},
};
