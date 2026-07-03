const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    
    attachmentUrl: {
        type: String,
        default: null
    },
    
    attachmentType: {
        type: String, // 'image' or 'video'
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);