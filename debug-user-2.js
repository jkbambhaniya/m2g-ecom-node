const db = require('./src/models');

async function test() {
    try {
        const userId = 2;
        const user = await db.User.findByPk(userId, {
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    include: [{ model: db.Product, attributes: ['id', 'title'] }]
                }
            ]
        });

        if (!user) {
            console.log(`User ${userId} not found`);
        } else {
            console.log(`User ${userId} - ${user.name}`);
            console.log(`CartItems count: ${user.cartItems.length}`);
            user.cartItems.forEach((item, i) => {
                console.log(`Item ${i + 1}: ProductID ${item.productId}, Quantity ${item.quantity}, Product: ${item.Product ? item.Product.title : 'NULL'}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
