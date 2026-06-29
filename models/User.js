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
    age: {
        type: Number,
        min: 0 // Optional: ensures age can't be negative
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'], // Optional: restricts to these exact values
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