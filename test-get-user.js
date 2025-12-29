const db = require('./src/models');

async function test() {
    try {
        // Ensure user 1 exists
        let user = await db.User.findByPk(1);
        if (!user) {
            user = await db.User.create({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'password'
            });
        }

        // Ensure a product exists
        let product = await db.Product.findOne();
        if (!product) {
            product = await db.Product.create({
                title: 'Test Product',
                slug: 'test-product',
                price: 10.00,
                stock: 100
            });
        }

        // Add item to cart
        await db.CartItem.upsert({
            userId: 1,
            productId: product.id,
            quantity: 5
        });

        // Fetch user with cart items
        const userData = await db.User.findByPk(1, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    include: [{ model: db.Product, attributes: ['id', 'title', 'image', 'price'] }]
                }
            ]
        });

        console.log('User with Cart Items (JSON):');
        console.log(JSON.stringify(userData.toJSON(), null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
