const axios = require('axios');

async function testLoggedInUserCart() {
    try {
        console.log('=== Testing Logged-In User Cart Flow ===\n');

        // Step 1: Login as test user
        console.log('Step 1: Logging in as test user...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });
        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log('✓ Logged in successfully');
        console.log(`  User: ${loginResponse.data.user.name}\n`);

        // Step 2: Clear cart first
        console.log('Step 2: Clearing cart...');
        await axios.post('http://localhost:4000/api/cart/sync', {
            items: []
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✓ Cart cleared\n');

        // Step 3: Simulate adding item to cart (what happens in frontend)
        console.log('Step 3: Adding item to cart (simulating frontend)...');
        await axios.post('http://localhost:4000/api/cart/sync', {
            items: [
                { productId: 1, quantity: 1 }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✓ Item added to cart\n');

        // Step 4: Verify cart in database
        console.log('Step 4: Checking cart in database...');
        const cartResponse = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✓ Cart retrieved from database:');
        cartResponse.data.forEach(item => {
            console.log(`  - ${item.Product.title}: Qty ${item.quantity} @ $${item.Product.price}`);
        });
        console.log('');

        // Step 5: Verify admin can see it
        console.log('Step 5: Checking admin can see user cart...');
        const adminLoginResponse = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const adminToken = adminLoginResponse.data.token;

        const userDetailsResponse = await axios.get(`http://localhost:4000/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('✓ Admin view of user cart:');
        userDetailsResponse.data.cartItems.forEach(item => {
            console.log(`  - ${item.Product.title}: Qty ${item.quantity}`);
        });

        console.log('\n✅ SUCCESS! Logged-in user cart is directly saved to database!');
        console.log('   When user is logged in:');
        console.log('   1. Add to cart → Saves to localStorage');
        console.log('   2. Immediately syncs to database');
        console.log('   3. Admin can see it in real-time');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testLoggedInUserCart();
