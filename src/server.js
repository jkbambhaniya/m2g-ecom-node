const app = require('./app');
const db = require('./models');
const { Server } = require('socket.io');
const http = require('http');

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

// Store connected admins
const connectedAdmins = new Set();

io.on('connection', (socket) => {
    console.log(`Admin connected: ${socket.id}`);
    connectedAdmins.add(socket.id);

    socket.on('disconnect', () => {
        console.log(`Admin disconnected: ${socket.id}`);
        connectedAdmins.delete(socket.id);
    });
});

// Make io accessible globally for controllers
app.locals.io = io;

async function start() {
    server.listen(PORT, () => console.log(`Server running on port ${PORT} - Restarted at ${new Date().toISOString()}`));
}
start();
