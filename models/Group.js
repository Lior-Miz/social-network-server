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
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Required to include virtuals in JSON output
    toObject: { virtuals: true } 
});

// This virtual property generates a dynamic name
groupSchema.virtual('displayName').get(function() {
    // If it's a standard group, return the name
    if (this.isGroupChat) {
        return this.name;
    }
    
    // If it's a DM, try to return member names if populated
    // Note: This works best if you .populate('members') before accessing this
    if (this.members && this.members.length > 0 && this.members[0].username) {
        return this.members.map(m => m.username).join(', ');
    }
    
    return "Direct Message";
});

module.exports = mongoose.model('Group', groupSchema);