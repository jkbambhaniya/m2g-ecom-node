'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    /* ===============================
       RESET TABLES (SAFE WAY)
    =============================== */
    await queryInterface.bulkDelete('cart_items', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('admins', null, {});

    /* ===============================
       ADMIN
    =============================== */
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('admins', [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    /* ===============================
       PARENT CATEGORIES
    =============================== */
    await queryInterface.bulkInsert('categories', [
      { id: 1, name: 'Fresh Produce', slug: 'fresh-produce' },
      { id: 2, name: 'Dairy & Eggs', slug: 'dairy-eggs' },
      { id: 3, name: 'Rice & Grains', slug: 'rice-grains' }
    ]);

    /* ===============================
       SUB CATEGORIES
    =============================== */
    await queryInterface.bulkInsert('categories', [
      { name: 'Fruits', slug: 'fruits', parent_id: 1 },
      { name: 'Vegetables', slug: 'vegetables', parent_id: 1 },
      { name: 'Milk', slug: 'milk', parent_id: 2 },
      { name: 'Eggs', slug: 'eggs', parent_id: 2 },
      { name: 'Rice', slug: 'rice', parent_id: 3 },
      { name: 'Pulses', slug: 'pulses', parent_id: 3 }
    ]);

    /* ===============================
       PRODUCTS
    =============================== */
    await queryInterface.bulkInsert('products', [
      {
        title: 'Fresh Apples',
        slug: 'fresh-apples',
        price: 120,
        discountPrice: 99,
        stock: 200,
        sku: 'FR-APL-001',
        images: JSON.stringify(['products/apples_1.jpg']),
        tags: JSON.stringify(['fruit', 'fresh']),
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    /* ===============================
       USERS
    =============================== */
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedUserPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedUserPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    /* ===============================
       ORDERS
    =============================== */
    await queryInterface.bulkInsert('orders', [
      {
        id: 1,
        userId: 1,
        total: 120.00,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        total: 99.00,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    /* ===============================
       ORDER ITEMS
    =============================== */
    const prod = await queryInterface.sequelize.query('SELECT id FROM products LIMIT 1');
    const productId = prod[0][0].id;

    await queryInterface.bulkInsert('order_items', [
      {
        orderId: 1,
        productId: productId,
        quantity: 1,
        price: 120.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 2,
        productId: productId,
        quantity: 1,
        price: 99.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    /* ===============================
       CART ITEMS
    =============================== */
    await queryInterface.bulkInsert('cart_items', [
      {
        userId: 1,
        productId: productId,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('cart_items', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('admins', null, {});
  }
};
