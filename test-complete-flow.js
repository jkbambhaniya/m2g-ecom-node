const axios = require('axios');

async function testCompleteFlow() {
    try {
        console.log('=== Testing Complete Cart Flow ===\n');

        // Step 1: Login
        console.log('Step 1: Logging in as test user...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });

        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log(`✓ Logged in as: ${loginResponse.data.user.name} (ID: ${userId})\n`);

        // Step 2: Sync cart (simulating frontend adding items)
        console.log('Step 2: Syncing cart with 2 items...');
        const syncResponse = await axios.post('http://localhost:4000/api/auth/cart/sync', {
            items: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ ${syncResponse.data.message}\n`);

        // Step 3: Get cart
        console.log('Step 3: Retrieving cart from database...');
        const cartResponse = await axios.get('http://localhost:4000/api/auth/cart', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Cart has ${cartResponse.data.length} items:`);
        cartResponse.data.forEach(item => {
            console.log(`  - ${item.Product?.title || 'Unknown'}: Qty ${item.quantity} @ $${item.Product?.price || 0}`);
        });
        console.log('');

        // Step 4: Verify admin can see it
        console.log('Step 4: Checking admin view...');
        const adminLoginResponse = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const adminToken = adminLoginResponse.data.token;
        const userDetailsResponse = await axios.get(`http://localhost:4000/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log(`✓ Admin view - User: ${userDetailsResponse.data.name}`);
        console.log(`✓ Cart items visible: ${userDetailsResponse.data.cartItems.length}`);
        userDetailsResponse.data.cartItems.forEach(item => {
            console.log(`  - ${item.Product?.title || 'Unknown'}: Qty ${item.quantity}`);
        });

        console.log('\n✅ SUCCESS! Complete cart flow is working!');
        console.log('\nWhat works now:');
        console.log('1. ✓ User can login');
        console.log('2. ✓ Cart syncs to database');
        console.log('3. ✓ Cart can be retrieved');
        console.log('4. ✓ Admin can see user cart');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.config?.url);
        }
    }
}

testCompleteFlow();
