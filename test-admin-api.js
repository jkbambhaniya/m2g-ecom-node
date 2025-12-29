const axios = require('axios');

async function testAdminAPI() {
    try {
        // First, login as admin to get token
        const loginResponse = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('Admin login successful');

        // Get user 2 details
        const userResponse = await axios.get('http://localhost:4000/api/admin/users/2', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = userResponse.data;
        console.log(`\nUser: ${user.name} (ID: ${user.id})`);
        console.log(`Cart Items: ${user.cartItems.length}`);

        if (user.cartItems.length > 0) {
            console.log('\nCart Items:');
            user.cartItems.forEach(item => {
                console.log(`- ${item.Product?.title || 'Unknown'}: Qty ${item.quantity} @ $${item.Product?.price || 0}`);
            });
        } else {
            console.log('No cart items found');
        }

        console.log('\n✓ Admin API is working correctly!');
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAdminAPI();
