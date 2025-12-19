const db = require('../models');

async function seed() {
  await db.sequelize.sync({ force: true });
  await db.Role.bulkCreate([{ name: 'admin' }, { name: 'customer' }]);
  const admin = await db.Admin.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', roleId: 1 });
  const cat = await db.Category.create({ name: 'General', slug: 'general' });
  await db.Product.bulkCreate([
    { title: 'Sample Product A', slug: 'sample-product-a', description: 'A sample product.', price: 9.99, stock: 100, image: '', categoryId: cat.id },
    { title: 'Sample Product B', slug: 'sample-product-b', description: 'Another sample product.', price: 19.99, stock: 50, image: '', categoryId: cat.id }
  ]);
  console.log('Seed finished. Admin credentials: admin@example.com / admin123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
