'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('products', 'categoryId', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
            after: 'tags',
            references: {
                model: 'categories',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addIndex('products', ['categoryId']);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('products', ['categoryId']);
        await queryInterface.removeColumn('products', 'categoryId');
    }
};
