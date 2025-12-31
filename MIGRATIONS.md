# Database Migrations - Complete Implementation

## Overview
Successfully created and executed **16 migration files** for the m2g-ecom Node.js e-commerce backend using Sequelize ORM with MySQL.

## Migration Files (in execution order)

### Base Tables (No Foreign Keys)
1. **20250101000001-create-admins-table.js**
   - Columns: id, name, email (unique), password, createdAt, updatedAt
   
2. **20250101000002-create-categories-table.js**
   - Columns: id, name, slug (unique), createdAt, updatedAt
   - Indexes: slug (for product filtering)

3. **20250101000003-create-users-table.js**
   - Columns: id, name, email (unique), password, phone, address, city, state, zipCode, createdAt, updatedAt

4. **20250101000004-create-settings-table.js**
   - Columns: id, key (unique), value, createdAt, updatedAt

5. **20250101000005-create-merchants-table.js**
   - Columns: id, name, email (unique), phone, address, image, status, createdAt, updatedAt

### Tables with FK References
6. **20250101000006-create-products-table.js**
   - Columns: id, name, slug (unique), description, price, image, stock, categoryId, merchantId, createdAt, updatedAt
   - Indexes: categoryId, merchantId, slug

7. **20250101000007-create-orders-table.js**
   - Columns: id, userId, totalAmount, status (pending/processing/shipped/delivered/cancelled), paymentStatus, shippingAddress, createdAt, updatedAt
   - Indexes: userId

8. **20250101000014-create-heroes-table.js**
   - Columns: id, title, subtitle, image, position, createdAt, updatedAt

### Dependent Tables (Product Variants & Order Items)
9. **20250101000017-create-product-variants-table.js**
   - Columns: id, productId, size, color, sku (unique), stock, price, createdAt, updatedAt
   - References: products(id)

10. **20250101000018-create-order-items-table.js**
    - Columns: id, orderId, productId, variantId, quantity, price, createdAt, updatedAt
    - References: orders(id)

### Payment & Cart Management
11. **20250101000019-create-payments-table.js**
    - Columns: id, orderId, amount, paymentMethod, transactionId (unique), status (pending/completed/failed/refunded), createdAt, updatedAt
    - References: orders(id)

12. **20250101000020-create-cart-items-table.js**
    - Columns: id, userId, productId, variantId, quantity, createdAt, updatedAt
    - References: users(id), products(id)

### User Interactions
13. **20250101000021-create-wishlist-items-table.js**
    - Columns: id, userId, productId, createdAt, updatedAt
    - References: users(id), products(id)

14. **20250101000022-create-reviews-table.js**
    - Columns: id, productId, userId, orderId, rating, title, comment, createdAt, updatedAt
    - References: products(id), users(id)

### Notifications
15. **20250101000023-create-notifications-table.js**
    - Columns: id, userId, merchantId, type, title, message, isRead, createdAt, updatedAt
    - References: users(id), merchants(id)

### Foreign Key Constraints (Added Separately)
16. **20250101000024-add-foreign-keys.js**
    - Adds all FK constraints after tables exist to avoid "errno 150" MySQL validation errors
    - Constraints added with ON DELETE CASCADE for referential integrity

## Key Implementation Details

### Why Two-Phase Approach?
The migrations use raw SQL CREATE TABLE statements instead of Sequelize's createTable() API to avoid MySQL error 150 "Foreign key constraint is incorrectly formed". This error occurs when:
- Sequelize tries to add inline FK constraints during table creation
- MySQL validates the constraint before all referenced tables exist

**Solution**: Create tables without inline FKs (using only INDEX definitions), then add constraints in a separate migration after all tables exist.

### Column Definitions
- **Primary Keys**: AUTO_INCREMENT INT
- **Foreign Key Columns**: INT (not AUTO_INCREMENT)
- **Timestamps**: TIMESTAMP with DEFAULT CURRENT_TIMESTAMP and ON UPDATE CURRENT_TIMESTAMP
- **Strings**: VARCHAR with appropriate lengths
- **Text**: LONGTEXT for descriptions/comments
- **Decimals**: DECIMAL(10,2) for prices
- **Enums**: ENUM('value1','value2',...) for status fields

### Storage Engine & Charset
- **Engine**: InnoDB (required for foreign key constraints)
- **Charset**: utf8mb4 (supports emoji and extended Unicode)
- **Collation**: utf8mb4_unicode_ci (case-insensitive Unicode)

## Execution Results

✅ **All 16 migrations executed successfully**
- Base tables created: 5 tables
- Dependent tables created: 10 tables
- Foreign key constraints added: 8 tables with multi-table references
- Total execution time: ~2.5 seconds
- Database: m2g_ecom, 16 total tables (including sequelizemeta)

## Database Relationships

```
categories
    ├─ products (categoryId)
    
merchants
    ├─ products (merchantId)
    ├─ notifications (merchantId)
    
products
    ├─ product_variants (productId)
    ├─ order_items (productId)
    ├─ cart_items (productId)
    ├─ reviews (productId)
    
users
    ├─ orders (userId)
    ├─ cart_items (userId)
    ├─ wishlist_items (userId)
    ├─ reviews (userId)
    ├─ notifications (userId)
    
orders
    ├─ order_items (orderId)
    ├─ payments (orderId)
```

## Testing & Verification

Database tables verified in m2g_ecom:
- admins ✓
- categories ✓
- users ✓
- settings ✓
- merchants ✓
- products (with categoryId, merchantId) ✓
- product_variants ✓
- orders ✓
- order_items ✓
- payments ✓
- cart_items ✓
- wishlist_items ✓
- reviews ✓
- heroes ✓
- notifications ✓
- sequelizemeta (migration tracking) ✓

## Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations
npm run migrate:undo:all

# Create new migration
npx sequelize-cli migration:generate --name migration-name
```

## Notes

- Migration files are in: `src/migrations/`
- Configuration: `src/config/config.js`
- All migrations are sequential (000001 → 000024)
- Foreign key constraints ensure data integrity
- Each table has automatic createdAt/updatedAt timestamps
- Indexes on FK columns optimize join performance
