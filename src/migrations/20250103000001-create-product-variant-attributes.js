'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variant_attributes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_variant_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: {
          model: 'product_variants',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      attribute_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false 
      },
      attribute_value_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false 
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_variant_attributes');
  }
};
