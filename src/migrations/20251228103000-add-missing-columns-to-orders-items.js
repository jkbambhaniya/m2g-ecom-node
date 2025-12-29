'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // More robust check
        const columns = await queryInterface.describeTable('order_items').catch(() => ({}));

        if (!columns.orderId && !columns.order_id) {
            await queryInterface.addColumn('order_items', 'orderId', {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            });
        }

        if (!columns.productId && !columns.product_id) {
            await queryInterface.addColumn('order_items', 'productId', {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            });
        }

        // Ensure userId index on orders
        try {
            await queryInterface.addIndex('orders', ['userId']);
        } catch (e) { }

        // Ensure indexes on order_items
        try {
            await queryInterface.addIndex('order_items', ['orderId']);
        } catch (e) { }
        try {
            await queryInterface.addIndex('order_items', ['productId']);
        } catch (e) { }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_items', 'productId').catch(() => { });
        await queryInterface.removeColumn('order_items', 'orderId').catch(() => { });
    }
};
