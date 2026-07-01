const Message = require('../models/Message');
const Group = require('../models/Group');

exports.sendMessage = async (req, res) => {
    try {
        const { groupId, content } = req.body;
        const senderId = req.user.id;

        const chat = await Group.findById(groupId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isDeletedChat =
            chat.isDeletedUserChat === true ||
            chat.name?.trim().toLowerCase() === 'deleted chat';

        if (isDeletedChat) {
            return res.status(403).json({
                message: "You cannot send a message to a deleted user chat."
            });
        }

        const newMessage = new Message({
            group: groupId,
            sender: senderId,
            content
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'username');

        const io = req.app.get('io');
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