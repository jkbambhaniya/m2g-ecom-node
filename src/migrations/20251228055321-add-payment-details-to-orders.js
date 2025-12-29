'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'paymentMethod', {
      type: Sequelize.STRING,
      defaultValue: 'COD'
    });
    await queryInterface.addColumn('orders', 'paymentStatus', {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('orders', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'paymentMethod');
    await queryInterface.removeColumn('orders', 'paymentStatus');
    await queryInterface.removeColumn('orders', 'transactionId');
  }
};
