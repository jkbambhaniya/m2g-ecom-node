'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        slug VARCHAR(255) NOT NULL UNIQUE,
        description LONGTEXT,
        shortDescription VARCHAR(500),
        price DECIMAL(12, 2) NOT NULL,
        discountPrice DECIMAL(12, 2),
        image VARCHAR(255),
        images LONGTEXT,
        stock INT DEFAULT 0,
        sku VARCHAR(100),
        rating DECIMAL(3, 2),
        ratingCount INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        isFeatured BOOLEAN DEFAULT FALSE,
        weight DECIMAL(8, 2),
        dimensions LONGTEXT,
        tags LONGTEXT,
        categoryId INT,
        merchantId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (categoryId),
        INDEX (merchantId),
        INDEX (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  },
};
