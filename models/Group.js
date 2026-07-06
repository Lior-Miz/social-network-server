/*const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });



module.exports = mongoose.model('Group', groupSchema);*/


const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    isDeletedUserChat: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    joinRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

// This virtual property generates a dynamic name
groupSchema.virtual('displayName').get(function() {
    // If its a standard group, return the name
    if (this.isGroupChat) {
        return this.name;
    }
    
    // If it's a private conversation, try to return member names if populated
    if (this.members && this.members.length > 0 && this.members[0].username) {
        return this.members.map(m => m.username).join(', ');
    }
    
    return "private conversation"; // Fallback name
});

module.exports = mongoose.model('Group', groupSchema);