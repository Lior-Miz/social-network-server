// sockets/socketHandler.js
const { Server } = require('socket.io');

const initializeSocket = (server, app) => {
    // this starts real time socket server and handles all events
    const io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    // This lets us use it from any controller
    app.set('io', io);

    // Handle socket events
    io.on('connection', (socket) => {
        console.log('User connected to socket:', socket.id);

        // Put the user into a conversation or group chat
        socket.on('join room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // take the user out of a room when they leave or close the chat
        socket.on('leave room', (roomId) => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });

        // This links a users socket to all their personal feed channels at once
        socket.on('join my_feed', async (userId) => {
            if (!userId) return;
            try {
                //needed to not crash on startup
                const Group = require('../models/Group');
                const mongoose = require('mongoose');

                // Look up every single group this specific user has joined
                const userGroups = await Group.find({ members: new mongoose.Types.ObjectId(userId) });
                const groupIds = userGroups.map(g => g._id.toString());

                groupIds.push("000000000000000000000000"); // Public feed
                socket.join(groupIds);
                console.log(`Socket ${socket.id} joined my_feed rooms for user ${userId}`);
            } catch (err) {
                console.error("Error joining my_feed rooms:", err);
            }
        });
        
        // Clean up and remove the user from all their feed rooms
        socket.on('leave my_feed', async (userId) => {
            if (!userId) return;
            try {
                const Group = require('../models/Group');
                const mongoose = require('mongoose');
                const userGroups = await Group.find({ members: new mongoose.Types.ObjectId(userId) });
                const groupIds = userGroups.map(g => g._id.toString());
                groupIds.push("000000000000000000000000");
                groupIds.forEach(id => socket.leave(id)); // Loop through and leave each room one by one 
            } catch (err) { }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

    });

    return io;
};

module.exports = initializeSocket;