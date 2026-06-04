const User = require('../models/User');

// Create and save a new user to the database
exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: "Error creating user", error: err.message });
    }
};

// Fetch and return a list of all users from the database
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

exports.updateUser = async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser);
    }catch(err) {
        res.status(400).json({ message: "Error updating user", error: err.message });
    }
};
exports.deleteUser = async (req, res) => {
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });

    }catch(err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};