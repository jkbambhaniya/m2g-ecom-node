const axios = require('axios');

const API_URL = 'http://localhost:4001/api';

async function verifyAdmin() {
  console.log('Starting Admin Verification...');
  
  const adminData = {
    name: 'Test Admin',
    email: 'testadmin_' + Date.now() + '@example.com',
    password: 'password123'
  };

  try {
    // 1. Create Admin
    console.log(`1. Creating Admin: ${adminData.email}`);
    const createRes = await axios.post(`${API_URL}/admin/create`, adminData);
    if (!createRes.data.admin) throw new Error('Failed to create admin');
    console.log('   Success: Admin created');

    // 2. Login Admin
    console.log('2. Logging in Admin...');
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: adminData.email,
      password: adminData.password
    });
    const { token } = loginRes.data;
    if (!token) throw new Error('No token received');
    console.log('   Success: Token received');

    // 3. Access Protected Route
    console.log('3. Accessing Protected Admin Route...');
    const protectedRes = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   Success: ' + protectedRes.data.message);

    console.log('\nVERIFICATION PASSED: All admin checks successful.');
  } catch (err) {
    if (err.response) {
        console.error('\nVERIFICATION FAILED:', err.response.status, err.response.statusText);
        // Only print data if it's object, otherwise it might be long HTML
        if (typeof err.response.data === 'object') {
            console.error(err.response.data);
        } else {
            console.error('Response data was not JSON (likely HTML error page).');
        }
    } else {
        console.error('\nVERIFICATION FAILED:', err.message);
    }
  }
}

verifyAdmin();
