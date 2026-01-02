const db = require('./src/models');

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    const email = `test+${Date.now()}@example.com`;
    const merchant = await db.Merchant.create({
      name: 'Test Merchant',
      email,
      password: 'pass1234',
      shopName: 'Test Shop',
      phone: '1234567890',
      isActive: false
    });

    console.log('Created merchant id=', merchant.id);

    // wait briefly for any notification creation (controller does in-line, but our direct create doesn't)
    // create notification manually to mimic controller behavior
    const notif = await db.Notification.create({
      type: 'merchant_registration',
      title: 'New merchant registered',
      message: `New merchant registered: ${merchant.shopName || merchant.name}`,
      merchantId: merchant.id,
      data: { merchantId: merchant.id }
    });

    console.log('Created notification id=', notif.id);

    const found = await db.Notification.findAll({ where: { merchantId: merchant.id } });
    console.log('Notifications for merchant:', found.map(n => ({ id: n.id, title: n.title, message: n.message })));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await db.sequelize.close();
  }
}

run();
