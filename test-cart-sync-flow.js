const axios = require('axios');

async function testCartSync() {
    try {
        console.log('=== Testing Cart Sync Flow ===\n');

        // Step 1: Login as test user
        console.log('Step 1: Logging in...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });

        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log(`✓ Logged in as: ${loginResponse.data.user.name} (ID: ${userId})\n`);

        // Step 2: Sync cart with items
        console.log('Step 2: Syncing cart with 2 items...');
        const syncResponse = await axios.post('http://localhost:4000/api/cart/sync', {
            items: [
                { productId: 1, quantity: 3 },
                { productId: 2, quantity: 1 }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Sync response: ${syncResponse.data.message}\n`);

        // Step 3: Get cart from API
        console.log('Step 3: Getting cart from API...');
        const cartResponse = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Cart items from API: ${cartResponse.data.length}`);
        cartResponse.data.forEach(item => {
            console.log(`  - ${item.Product?.title || 'Unknown'}: Qty ${item.quantity}`);
        });
        console.log('');

        // Step 4: Check admin view
        console.log('Step 4: Checking admin view...');
        const adminLoginResponse = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const adminToken = adminLoginResponse.data.token;
        const userDetailsResponse = await axios.get(`http://localhost:4000/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log(`✓ Admin view - Cart items: ${userDetailsResponse.data.cartItems.length}`);
        userDetailsResponse.data.cartItems.forEach(item => {
            console.log(`  - ${item.Product?.title || 'Unknown'}: Qty ${item.quantity}`);
        });

        if (cartResponse.data.length > 0 && userDetailsResponse.data.cartItems.length > 0) {
            console.log('\n✅ SUCCESS! Cart sync is working correctly!');
        } else {
            console.log('\n❌ ISSUE: Cart sync or admin view not working');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Full error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCartSync();
