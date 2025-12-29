const db = require('./src/models');

async function listUsers() {
    try {
        const users = await db.User.findAll({
            attributes: ['id', 'name', 'email']
        });

        console.log('Users in database:');
        users.forEach(u => {
            console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
