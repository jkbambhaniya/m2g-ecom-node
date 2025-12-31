const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root'
  });

  try {
    // Drop the database
    await conn.execute('DROP DATABASE IF EXISTS m2g_ecom');
    console.log('✓ Dropped m2g_ecom database');

    // Recreate empty database
    await conn.execute('CREATE DATABASE m2g_ecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✓ Created m2g_ecom database');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
})();
