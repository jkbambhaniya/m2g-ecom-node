const app = require('./app');
const db = require('./models');
const PORT = process.env.PORT || 4000;

async function start() {
  await db.sequelize.sync();
  // create default roles if not exist
  const Role = db.Role;
  const roles = await Role.findAll();
  if (roles.length === 0) {
    await Role.bulkCreate([{ name: 'admin' }, { name: 'customer' }]);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
start();
