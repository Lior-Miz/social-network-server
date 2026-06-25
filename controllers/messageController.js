const Message = require('../models/Message'); // Fixed: Import the correct Model

exports.sendMessage = async (req, res) => {
    try {
        const { groupId, content } = req.body;
        const senderId = req.user.id;

        // 1. Save the message to MongoDB
        const newMessage = new Message({
            group: groupId,
            sender: senderId,
            content: content
        });

        const savedMessage = await newMessage.save();

        // 2. Populate sender so the frontend gets a username, not just an ID
        await savedMessage.populate('sender', 'username');

        // 3. Emit via Socket.io
        const io = req.app.get('io');
        // We emit the savedMessage object so the frontend has the createdAt/ID
        io.to(groupId).emit('new_message', savedMessage);

        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: "Error sending message", error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ group: groupId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 }); // Oldest to newest

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages", error: err.message });
    }
};