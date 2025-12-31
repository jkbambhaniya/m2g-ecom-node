'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(255) DEFAULT 'pending',
        paymentMethod VARCHAR(255) DEFAULT 'COD',
        paymentStatus VARCHAR(255) DEFAULT 'pending',
        transactionId VARCHAR(255),
        billingAddress LONGTEXT,
        shippingAddress LONGTEXT,
        razorpayOrderId VARCHAR(255),
        razorpayPaymentId VARCHAR(255),
        razorpaySignature VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (userId),
        INDEX (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};
