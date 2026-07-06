const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true
        },
    password :{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth: { 
        type: Date 
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say'
    },
    language: [{
        type: String // Stores an array of strings like ["English", "Spanish", "Hebrew"]
    }],
    groups :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
    }, { timestamps: true });
module.exports = mongoose.model('User', userSchema);