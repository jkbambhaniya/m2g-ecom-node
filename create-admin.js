const db = require('./src/models');

async function createAdmin() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connected');

        const admin = await db.Admin.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123'
        });

        console.log('Admin created successfully:');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        console.log('ID:', admin.id);
    } catch (error) {
        console.error('Error creating admin:', error.message);
    } finally {
        process.exit();
    }
}

createAdmin();
