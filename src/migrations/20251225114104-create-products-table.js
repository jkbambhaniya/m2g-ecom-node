'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      shortDescription: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },

      discountPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      sku: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true
      },

      image: {
        type: Sequelize.STRING,
        allowNull: true
      },

      images: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },

      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },

      ratingCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      weight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },

      dimensions: {
        type: Sequelize.JSON,
        allowNull: true
      },

      tags: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
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

    // Indexes
    await queryInterface.addIndex('products', ['isActive']);
    await queryInterface.addIndex('products', ['isFeatured']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
