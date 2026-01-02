const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../models');

// Initialize Razorpay
// Note: In production, these should be environment variables
const razorpay = new Razorpay({
    key_id: (process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder').trim(),
    key_secret: (process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder').trim()
});

async function createOrder(req, res) {
    try {
        const { amount, currency = 'INR' } = req.body;

        // Amount in paise
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function verifyPayment(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our internal order ID
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment successful

            // Update the order in our database
            if (orderId) {
                const updatedOrder = await db.Order.findByPk(orderId);
                
                await db.Order.update({
                    paymentStatus: 'completed',
                    paymentMethod: 'razorpay',
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'processing' // Move from pending to processing
                }, {
                    where: { id: orderId },
                    transaction
                });

                // Get updated order with relationships
                const order = await db.Order.findByPk(orderId, {
                    include: [
                        { model: db.User, attributes: ['id', 'name', 'email'] },
                        { model: db.OrderItem }
                    ],
                    transaction
                });

                await transaction.commit();

                // Emit WebSocket event for new order
                if (req.app.locals.broadcastNewOrder) {
                    req.app.locals.broadcastNewOrder(order);
                }

                res.json({
                    success: true,
                    message: "Payment verified successfully",
                    orderId: order.id
                });
            } else {
                await transaction.commit();
                res.json({
                    success: true,
                    message: "Payment verified successfully"
                });
            }
        } else {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Payment verification error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getTransactionHistory(req, res) {
    try {
        const userId = req.user.id; // Assuming auth middleware adds user to req
        const transactions = await db.Order.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'total', 'status', 'paymentStatus', 'paymentMethod', 'createdAt', 'razorpayPaymentId']
        });
        res.json(transactions);
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getAllTransactions(req, res) {
    try {
        const transactions = await db.Order.findAll({
            include: [{
                model: db.User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'total', 'status', 'paymentStatus', 'paymentMethod', 'createdAt', 'razorpayPaymentId']
        });
        res.json(transactions);
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createOrder,
    verifyPayment,
    getTransactionHistory,
    getAllTransactions
};
