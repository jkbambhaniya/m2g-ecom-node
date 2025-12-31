const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'm2g_ecom'
  });

  try {
    const [rows] = await conn.execute("SHOW TABLES");
    console.log('Tables in m2g_ecom:');
    rows.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('  -', tableName);
    });

    // Check products table structure
    console.log('\nProducts table structure:');
    const [productCols] = await conn.execute('DESCRIBE products');
    productCols.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
})();
