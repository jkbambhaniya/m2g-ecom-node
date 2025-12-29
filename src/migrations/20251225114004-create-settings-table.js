'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      siteName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'My E-Commerce'
      },

      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },

      faviconUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },

      primaryColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '#3b82f6'
      },

      accentColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '#1e40af'
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Settings');
  }
};
