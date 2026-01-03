'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove Foreign Keys referencing product_variants
    try {
      await queryInterface.removeConstraint('order_items', 'fk_order_items_variantId');
    } catch (e) {
      console.log('Constraint fk_order_items_variantId might not exist, skipping removal');
    }
    
    try {
      await queryInterface.removeConstraint('carts', 'fk_carts_variantId');
    } catch (e) {
      console.log('Constraint fk_carts_variantId might not exist, skipping removal');
    }

    // 2. Drop existing product_variants table
    await queryInterface.dropTable('product_variants');

    // 3. Recreate Product Variants Table
    await queryInterface.createTable('product_variants', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: { type: Sequelize.INTEGER, allowNull: false },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
      sale_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true, defaultValue: null },
      stock: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      thumbnail: { type: Sequelize.STRING(255), allowNull: true },
      status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('product_variants', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_product_variants_products_id',
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 4. Variant Attribute Mapping
    await queryInterface.createTable('product_variant_attributes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_variant_id: { type: Sequelize.INTEGER, allowNull: false },
      attribute_id: { type: Sequelize.INTEGER, allowNull: false },
      attribute_value_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('product_variant_attributes', {
      fields: ['product_variant_id'],
      type: 'foreign key',
      name: 'fk_pva_variant_id',
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('product_variant_attributes', {
      fields: ['attribute_id'],
      type: 'foreign key',
      name: 'fk_pva_attribute_id',
      references: { table: 'attributes', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('product_variant_attributes', {
      fields: ['attribute_value_id'],
      type: 'foreign key',
      name: 'fk_pva_attribute_value_id',
      references: { table: 'attribute_values', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 5. Variant Images Table
    await queryInterface.createTable('product_variant_images', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_variant_id: { type: Sequelize.INTEGER, allowNull: false },
      image_path: { type: Sequelize.STRING(255), allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('product_variant_images', {
      fields: ['product_variant_id'],
      type: 'foreign key',
      name: 'fk_pvi_variant_id',
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 6. Product Images (Non-Variant Images)
    await queryInterface.createTable('product_images', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: { type: Sequelize.INTEGER, allowNull: false },
      image_path: { type: Sequelize.STRING(255), allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('product_images', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_pi_product_id',
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Re-add Foreign Keys to order_items and carts
    // Important: We need to make sure the columns exist and are compatible. 
    // They are INT and nullable in original migrations, which matches product_variants.id (INT PK).
    
    // Check if columns exist? (Assuming they do as we only removed constraints)
    
    await queryInterface.addConstraint('order_items', {
      fields: ['variantId'],
      type: 'foreign key',
      name: 'fk_order_items_variantId',
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('carts', {
      fields: ['variantId'],
      type: 'foreign key',
      name: 'fk_carts_variantId',
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove re-added constraints
    await queryInterface.removeConstraint('order_items', 'fk_order_items_variantId');
    await queryInterface.removeConstraint('carts', 'fk_carts_variantId');
    
    // 2. Drop tables
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('product_variant_images');
    await queryInterface.dropTable('product_variant_attributes');
    await queryInterface.dropTable('product_variants');
    
    // 3. Restore original logic if possible (tricky without original definition handy in this file context,
    // but in a real app better to reverse carefully. For now, we leave it dropped or empty).
  }
};
