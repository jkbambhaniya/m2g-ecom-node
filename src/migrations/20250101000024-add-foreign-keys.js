'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraints for all tables
    await queryInterface.sequelize.query(`
      ALTER TABLE products 
      ADD CONSTRAINT fk_products_categoryId FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_products_merchantId FOREIGN KEY (merchantId) REFERENCES merchants(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE product_variants 
      ADD CONSTRAINT fk_product_variants_productId FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT fk_orders_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE order_items 
      ADD CONSTRAINT fk_order_items_orderId FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE payments 
      ADD CONSTRAINT fk_payments_orderId FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE cart_items 
      ADD CONSTRAINT fk_cart_items_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_cart_items_productId FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE wishlist_items 
      ADD CONSTRAINT fk_wishlist_items_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_wishlist_items_productId FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT fk_reviews_productId FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_reviews_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT fk_notifications_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_notifications_merchantId FOREIGN KEY (merchantId) REFERENCES merchants(id) ON DELETE CASCADE
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop foreign keys in reverse order
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications DROP FOREIGN KEY fk_notifications_merchantId, DROP FOREIGN KEY fk_notifications_userId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_userId, DROP FOREIGN KEY fk_reviews_productId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE wishlist_items DROP FOREIGN KEY fk_wishlist_items_productId, DROP FOREIGN KEY fk_wishlist_items_userId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE cart_items DROP FOREIGN KEY fk_cart_items_productId, DROP FOREIGN KEY fk_cart_items_userId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE payments DROP FOREIGN KEY fk_payments_orderId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE order_items DROP FOREIGN KEY fk_order_items_orderId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE orders DROP FOREIGN KEY fk_orders_userId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE product_variants DROP FOREIGN KEY fk_product_variants_productId
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE products DROP FOREIGN KEY fk_products_merchantId, DROP FOREIGN KEY fk_products_categoryId
    `);
  },
};
