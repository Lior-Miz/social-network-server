const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); //for socket
require('dotenv').config();



// Import our custom routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
//const messageRoutes = require('./routes/messageRoutes');

const app = express();

const server = http.createServer(app);
const initializeSocket = require('./sockets/socketHandler');

app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initializeSocket(server, app);

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI)
  .then((conn) => {
      console.log(`Successfully connected to MongoDB`);
  })
  .catch((err) => console.error('MongoDB connection error:', err));


// Connect the routes to the app
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
//app.use('/api/messages', messageRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the Social Network API!');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});