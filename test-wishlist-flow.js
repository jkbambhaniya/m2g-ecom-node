const axios = require('axios');

async function testWishlistFlow() {
    try {
        console.log('=== Testing Wishlist Flow ===\n');

        // Step 1: Login
        console.log('Step 1: Logging in as test user...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });

        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log(`✓ Logged in as: ${loginResponse.data.user.name} (ID: ${userId})\n`);

        // Step 2: Add to Wishlist
        console.log('Step 2: Adding product to wishlist...');
        const productId = 1; // Assuming product ID 1 exists
        try {
            const addResponse = await axios.post('http://localhost:4000/api/auth/wishlist/add', {
                productId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✓ Add response: ${addResponse.data.message}`);
        } catch (e) {
            console.log(`(Note: ${e.response?.data?.error || e.message})`);
        }

        // Step 3: Get Wishlist
        console.log('\nStep 3: Retrieving wishlist...');
        const wishlistResponse = await axios.get('http://localhost:4000/api/auth/wishlist', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Wishlist has ${wishlistResponse.data.length} items:`);
        wishlistResponse.data.forEach(item => {
            console.log(`  - ${item.Product?.title || 'Unknown'}: ID ${item.id}`);
        });

        // Step 4: Sync Wishlist
        console.log('\nStep 4: Syncing wishlist (simulating frontend sync)...');
        const syncResponse = await axios.post('http://localhost:4000/api/auth/wishlist/sync', {
            items: [{ productId: 1 }, { productId: 2 }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✓ Sync response: ${syncResponse.data.message}`);

        // Step 5: Verify via Admin API
        console.log('\nStep 5: Checking admin view...');
        const adminLoginResponse = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const adminToken = adminLoginResponse.data.token;
        const userDetailsResponse = await axios.get(`http://localhost:4000/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const wishlistItems = userDetailsResponse.data.wishlistItems;
        console.log(`✓ Admin view - Wishlist items: ${wishlistItems?.length}`);
        if (wishlistItems) {
            wishlistItems.forEach(item => {
                console.log(`  - ${item.Product?.title}`);
            });
        }

        if (wishlistItems && wishlistItems.length >= 2) {
            console.log('\n✅ SUCCESS! Wishlist flow is working!');
        } else {
            console.log('\n⚠️ PARTIAL SUCCESS: Check output details.');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.config?.url);
        }
    }
}

testWishlistFlow();
