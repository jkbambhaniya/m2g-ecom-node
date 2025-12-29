const db = require('./src/models');

async function createTestUser() {
    try {
        // Check if test user exists
        let user = await db.User.findOne({ where: { email: 'test@example.com' } });

        if (user) {
            console.log('Test user already exists');
            console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
        } else {
            // Create test user
            user = await db.User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'test123'
            });
            console.log('✓ Test user created successfully!');
            console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            console.log('Password: test123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();
