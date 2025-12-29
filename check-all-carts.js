const db = require('./src/models');

async function checkAllCarts() {
    try {
        console.log('=== Checking All User Carts ===\n');

        // Get all users with their cart items
        const users = await db.User.findAll({
            attributes: ['id', 'name', 'email'],
            include: [{
                model: db.CartItem,
                as: 'cartItems',
                include: [{
                    model: db.Product,
                    attributes: ['id', 'title', 'price']
                }]
            }]
        });

        console.log(`Found ${users.length} users\n`);

        users.forEach(user => {
            console.log(`User ID: ${user.id}`);
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Cart Items: ${user.cartItems.length}`);

            if (user.cartItems.length > 0) {
                user.cartItems.forEach(item => {
                    console.log(`  - ${item.Product?.title || 'Unknown'}: Qty ${item.quantity}`);
                });
            } else {
                console.log('  (Empty cart)');
            }
            console.log('');
        });

        // Also check raw cart_items table
        const allCartItems = await db.CartItem.findAll({
            include: [{
                model: db.Product,
                attributes: ['title']
            }]
        });

        console.log(`\nTotal cart items in database: ${allCartItems.length}`);
        if (allCartItems.length > 0) {
            console.log('\nAll cart items:');
            allCartItems.forEach(item => {
                console.log(`  UserID: ${item.userId}, Product: ${item.Product?.title}, Qty: ${item.quantity}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAllCarts();
