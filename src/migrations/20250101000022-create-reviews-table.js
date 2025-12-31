'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        orderId INT,
        rating TINYINT NOT NULL,
        comment LONGTEXT,
        isApproved BOOLEAN DEFAULT FALSE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (userId),
        INDEX (productId),
        INDEX (isApproved),
        INDEX (productId, isApproved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  },
};
