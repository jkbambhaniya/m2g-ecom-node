const db = require('./src/models');

async function addCartItems() {
    try {
        const userId = 2;

        // Get a product to add to cart
        const product = await db.Product.findOne();
        if (!product) {
            console.log('No products found in database');
            process.exit(1);
        }

        // Clear existing cart items for user 2
        await db.CartItem.destroy({ where: { userId } });

        // Add cart items for user 2
        await db.CartItem.bulkCreate([
            { userId, productId: product.id, quantity: 3 },
        ]);

        console.log(`Added cart items for user ${userId}`);
        console.log(`Product: ${product.title} (ID: ${product.id}), Quantity: 3`);

        // Verify
        const user = await db.User.findByPk(userId, {
            include: [{
                model: db.CartItem,
                as: 'cartItems',
                include: [{ model: db.Product, attributes: ['id', 'title', 'price'] }]
            }]
        });

        console.log('\nVerification:');
        console.log(`User ${userId} now has ${user.cartItems.length} cart item(s)`);
        user.cartItems.forEach(item => {
            console.log(`- ${item.Product.title}: ${item.quantity} @ $${item.Product.price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addCartItems();
