const db = require('../models');

async function checkout(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
        const {
            items,
            paymentMethod,
            paymentStatus,
            transactionId,
            billingAddress,
            shippingAddress,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            razorpayResponse
        } = req.body;
        const userId = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        // Validating items and calculating total
        for (const item of items) {
            const product = await db.Product.findByPk(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.title}`);
            }

            const price = product.discountPrice || product.price;
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: price
            });

            // Update stock
            product.stock -= item.quantity;
            await product.save({ transaction });
        }

        // Create Order
        const order = await db.Order.create({
            userId,
            total: totalAmount,
            status: paymentStatus === 'completed' ? 'processing' : 'pending',
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentStatus || 'pending',
            transactionId: transactionId || null,
            razorpayOrderId: razorpayOrderId || null,
            razorpayPaymentId: razorpayPaymentId || null,
            razorpaySignature: razorpaySignature || null,
            billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
            shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null
        }, { transaction });

        // Create Payment record
        await db.Payment.create({
            orderId: order.id,
            amount: totalAmount,
            paymentMethod: paymentMethod || 'COD',
            status: paymentStatus || 'pending',
            transactionId: transactionId || null,
            gatewayResponse: razorpayResponse || null
        }, { transaction });

        // Create Order Items
        for (const itemData of orderItemsData) {
            await db.OrderItem.create({
                orderId: order.id,
                productId: itemData.productId,
                quantity: itemData.quantity,
                price: itemData.price
            }, { transaction });
        }

        // Clear user's persistent cart if any
        await db.Cart.destroy({
            where: { userId },
            transaction
        });

        await transaction.commit();

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: order.id
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { checkout };
