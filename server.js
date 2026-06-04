const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import our custom routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/social_network';

// Connect to MongoDB (Updated to the modern syntax without deprecated options)
mongoose.connect(MONGO_URI)
.then(() => console.log('Successfully connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Connect the routes to the app
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the Social Network API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});