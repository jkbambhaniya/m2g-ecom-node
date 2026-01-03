'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Attributes Table
    await queryInterface.createTable('attributes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // 2. Attribute Values Table
    await queryInterface.createTable('attribute_values', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      attribute_id: { type: Sequelize.INTEGER, allowNull: false },
      value: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // Foreign Key for attribute_values
    await queryInterface.addConstraint('attribute_values', {
      fields: ['attribute_id'],
      type: 'foreign key',
      name: 'fk_attribute_values_attribute_id',
      references: { table: 'attributes', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('attribute_values', 'fk_attribute_values_attribute_id');
    await queryInterface.dropTable('attribute_values');
    await queryInterface.dropTable('attributes');
  }
};
