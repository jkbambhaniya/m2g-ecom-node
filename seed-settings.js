const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'm2g_ecom'
  });

  try {
    // Check if settings exists
    const [rows] = await conn.execute('SELECT * FROM settings LIMIT 1');
    
    if (rows.length === 0) {
      // Insert default settings
      await conn.execute(`
        INSERT INTO settings (siteName, primaryColor, accentColor, createdAt, updatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `, ['M2G Ecom', '#3b82f6', '#1e40af']);
      console.log('✓ Default settings inserted');
    } else {
      console.log('✓ Settings already exist');
    }

    // Display settings
    const [settings] = await conn.execute('SELECT * FROM settings');
    console.log('Settings:', settings);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
})();
