const axios = require('axios');

async function testUserLogin() {
    try {
        console.log('Testing user login...\n');

        // Test login
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'john@example.com',
            password: 'user123'
        });

        console.log('✓ Login successful!');
        console.log(`Token: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`User: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`);

        const token = loginResponse.data.token;

        // Test cart sync
        console.log('\nTesting cart sync...');
        const syncResponse = await axios.post('http://localhost:4000/api/cart/sync', {
            items: [
                { productId: 1, quantity: 2 }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✓ Cart sync successful!');
        console.log(`Response: ${syncResponse.data.message}`);

        // Get cart
        console.log('\nGetting cart...');
        const cartResponse = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✓ Cart retrieved successfully!');
        console.log(`Cart items: ${cartResponse.data.length}`);
        cartResponse.data.forEach(item => {
            console.log(`  - ${item.Product.title}: Qty ${item.quantity}`);
        });

        console.log('\n✅ All tests passed! Frontend user login should work now.');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testUserLogin();
