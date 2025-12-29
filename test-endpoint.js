const axios = require('axios');

async function testEndpoint() {
    try {
        // Test without auth first
        console.log('Testing cart sync endpoint...\n');

        const response = await axios.post('http://localhost:4000/api/auth/cart/sync', {
            items: []
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
        console.log('\nThis is expected - endpoint requires authentication');

        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('✓ Endpoint exists but requires auth (correct!)');
        } else if (error.response?.status === 404) {
            console.log('❌ Endpoint not found - route issue');
        }
    }
}

testEndpoint();
