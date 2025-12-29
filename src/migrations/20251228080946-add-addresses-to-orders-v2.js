'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'billingAddress', {
      type: Sequelize.TEXT, // Using TEXT to store JSON string for compatibility
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'shippingAddress', {
      type: Sequelize.TEXT, // Using TEXT to store JSON string for compatibility
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'billingAddress');
    await queryInterface.removeColumn('orders', 'shippingAddress');
  }
};
