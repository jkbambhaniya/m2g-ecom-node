const app = require('./app');
const db = require('./models');
const { Server } = require('socket.io');
const http = require('http');
const { calculateDashboardStats } = require('./services/statsService');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Socket.IO setup for real-time notifications
const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Store connected admins and users
const connectedAdmins = new Set();
const connectedUsers = new Map(); // Map of userId -> socket IDs

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle admin connection
    socket.on('admin_connect', (adminData) => {
        connectedAdmins.add(socket.id);
        console.log(`✅ Admin connected: ${socket.id}`, adminData);
        io.emit('admin_status', {
            adminConnected: true,
            adminCount: connectedAdmins.size,
            timestamp: new Date().toISOString()
        });
    });

    // Handle user login
    socket.on('user_login', (userData) => {
        const userId = userData.id;
        if (!connectedUsers.has(userId)) {
            connectedUsers.set(userId, []);
        }
        connectedUsers.get(userId).push(socket.id);
        console.log(`👤 User logged in: ${userId}`);

        // Broadcast user login event to admins
        io.emit('user_login', {
            userId,
            name: userData.name,
            email: userData.email,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (connectedAdmins.has(socket.id)) {
            connectedAdmins.delete(socket.id);
            console.log(`❌ Admin disconnected: ${socket.id}`);
            io.emit('admin_status', {
                adminConnected: false,
                adminCount: connectedAdmins.size,
                timestamp: new Date().toISOString()
            });
        }

        // Remove user connection
        for (const [userId, socketIds] of connectedUsers) {
            const index = socketIds.indexOf(socket.id);
            if (index > -1) {
                socketIds.splice(index, 1);
                if (socketIds.length === 0) {
                    connectedUsers.delete(userId);
                }
                console.log(`👤 User disconnected: ${userId}`);
                break;
            }
        }
    });

    // Handle custom events
    socket.on('subscribe_dashboard', () => {
        socket.join('dashboard_admins');
        console.log('📊 Admin subscribed to dashboard');
    });

    socket.on('subscribe_orders', () => {
        socket.join('orders_admins');
        console.log('📦 Admin subscribed to orders');
    });

    socket.on('subscribe_users', () => {
        socket.join('users_admins');
        console.log('👥 Admin subscribed to users');
    });
});

// Emit order status update events
const broadcastOrderUpdate = (order, eventType = 'order_status_updated') => {
    io.to('orders_admins').emit(eventType, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        customerName: order.User?.name,
        timestamp: new Date().toISOString()
    });
};

const broadcastNewOrder = (order) => {
    io.to('orders_admins').emit('new_order', {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        User: { name: order.User?.name },
        status: order.status,
        createdAt: order.createdAt,
        timestamp: new Date().toISOString()
    });

    // Also broadcast to dashboard admins
    io.to('dashboard_admins').emit('dashboard_update', {
        eventType: 'new_order',
        orderId: order.id,
        amount: order.total,
        timestamp: new Date().toISOString()
    });

    // Broadcast updated stats
    broadcastDashboardStats();
};

const broadcastDashboardStats = async () => {
    try {
        const stats = await calculateDashboardStats();
        io.to('dashboard_admins').emit('dashboard_stats_update', stats);
        console.log('📊 Dashboard stats broadcasted');
    } catch (error) {
        console.error('Error broadcasting dashboard stats:', error);
    }
};

// Make utilities globally accessible for controllers
app.locals.io = io;
app.locals.broadcastOrderUpdate = broadcastOrderUpdate;
app.locals.broadcastNewOrder = broadcastNewOrder;
app.locals.broadcastDashboardStats = broadcastDashboardStats;
app.locals.connectedUsers = connectedUsers;

async function start() {
    server.listen(PORT, () => console.log(`Server running on port ${PORT} - Restarted at ${new Date().toISOString()}`));
}
start();
