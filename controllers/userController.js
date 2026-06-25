const User = require('../models/User');
const jwt = require('jsonwebtoken');

// register user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Edge Case: Missing entirely
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        // Edge Case: User tried to bypass by typing spaces ("   ")
        if (!username.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ message: "Fields cannot be empty or contain only spaces." });
        }

        // Edge Case: Duplicates
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email or username already exists" });
        }

        // save user
        const newUser = new User({
            username,
            email,
            password 
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { id: savedUser._id, username: savedUser.username, email: savedUser.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Edge Case: Missing fields entirely
        if (!email || !password) {
            // Edge Case: Empty strings or just spaces
            if (!email.trim() || !password.trim()) {
                return res.status(400).json({ message: "Email and password cannot be blank." });
            }

            return res.status(400).json({ message: "Both email and password are required." });
        }


        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
            console.error("Login Error:", err);
            res.status(500).json({ message: "An unexpected error occurred during login." });
    }
};

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
        const currentUserId = req.user.id; 
        const updatedUser = await User.findByIdAndUpdate(currentUserId,req.body,{new:true});

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
        const currentUserId = req.user.id;
        const deletedUser = await User.findByIdAndDelete(currentUserId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });

    }catch(err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};