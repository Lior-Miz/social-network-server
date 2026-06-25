// sockets/socketHandler.js
const { Server } = require('socket.io');

const initializeSocket = (server, app) => {
    // 1. הגדרת שרת ה-Socket.io
    const io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    // 2. שומרים את io בתוך ה-app כדי שנוכל לגשת אליו מכל Controller
    app.set('io', io);

    // 3. ניהול כל אירועי הסוקט
    io.on('connection', (socket) => {
        console.log('User connected to socket:', socket.id);

        socket.on('join room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on('leave room', (roomId) => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        // בעתיד תוכל להוסיף כאן עוד אירועים כמו 'typing', 'read receipt' וכו'
    });

    return io;
};

module.exports = initializeSocket;