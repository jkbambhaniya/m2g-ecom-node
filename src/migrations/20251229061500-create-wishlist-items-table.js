'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('wishlist_items', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            productId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('wishlist_items', ['userId']);
        await queryInterface.addIndex('wishlist_items', ['productId']);

        // Add unique constraint to prevent duplicate wishlist items
        await queryInterface.addConstraint('wishlist_items', {
            fields: ['userId', 'productId'],
            type: 'unique',
            name: 'unique_user_product_wishlist'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('wishlist_items');
    }
};
