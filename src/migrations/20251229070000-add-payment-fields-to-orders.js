'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('orders', 'paymentMethod', {
                type: Sequelize.STRING,
                defaultValue: 'cod',
                allowNull: false
            });
        } catch (e) {
            console.log('Column paymentMethod already exists, skipping...');
        }

        try {
            await queryInterface.addColumn('orders', 'paymentStatus', {
                type: Sequelize.STRING,
                defaultValue: 'pending', // pending, completed, failed
                allowNull: false
            });
        } catch (e) {
            console.log('Column paymentStatus already exists, skipping...');
        }

        try {
            await queryInterface.addColumn('orders', 'razorpayOrderId', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } catch (e) {
            console.log('Column razorpayOrderId already exists, skipping...');
        }

        try {
            await queryInterface.addColumn('orders', 'razorpayPaymentId', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } catch (e) {
            console.log('Column razorpayPaymentId already exists, skipping...');
        }

        try {
            await queryInterface.addColumn('orders', 'razorpaySignature', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } catch (e) {
            console.log('Column razorpaySignature already exists, skipping...');
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('orders', 'paymentMethod');
        await queryInterface.removeColumn('orders', 'paymentStatus');
        await queryInterface.removeColumn('orders', 'razorpayOrderId');
        await queryInterface.removeColumn('orders', 'razorpayPaymentId');
        await queryInterface.removeColumn('orders', 'razorpaySignature');
    }
};
