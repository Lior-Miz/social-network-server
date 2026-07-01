const User = require('../models/User');
const Group = require('../models/Group');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// register user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, dateOfBirth, gender, language } = req.body;
        // Edge Case: Missing entirely
        const missingFields = [];
        if (!username) missingFields.push('username');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!dateOfBirth) missingFields.push('dateOfBirth');
        if (!gender) missingFields.push('gender');
        if (!language || !language.length) missingFields.push('language');

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}` });
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
            password,
            dateOfBirth,
            gender,
            language
        });

        const savedUser = await newUser.save();

        const token = jwt.sign(
            { id: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                dateOfBirth: savedUser.dateOfBirth,
                age: calculateAge(savedUser.dateOfBirth)
            }
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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                age: calculateAge(user.dateOfBirth)
            }
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
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { username, gender, langauge } = req.body;

        // 1. Build an isolated update object (Whitelisting)
        const updates = {};

        // 2. Handle Username updates & edge cases
        if (username !== undefined) {
            if (!username.trim()) {
                return res.status(400).json({ message: "Username cannot be empty or blank." });
            }

            // Check if the new username is already taken by ANOTHER user
            const existingUser = await User.findOne({
                username: username.trim(),
                _id: { $ne: currentUserId } // Exclude the current user from the search
            });

            if (existingUser) {
                return res.status(400).json({ message: "Username is already taken." });
            }

            updates.username = username.trim();
        }

        // 3. Map other profile fields safely
        if (gender !== undefined) updates.gender = gender;
        if (langauge !== undefined) updates.langauge = langauge;

        // 4. Update the user with active schema validation rules
        const updatedUser = await User.findByIdAndUpdate(
            currentUserId,
            { $set: updates },
            {
                new: true,           // Return the modified document rather than the old one
                runValidators: true  // CRITICAL: Forces mongoose to check enums, mins/maxs, etc.
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 5. Sanitize and send the response (Leave out the password!)
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                gender: updatedUser.gender,
                langauge: updatedUser.langauge
            }
        });

    } catch (err) {
        // Catch Mongoose-specific validation errors (e.g., age below 0 or invalid gender enum)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", error: err.message });
        }
        res.status(500).json({ message: "Error updating user", error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const currentUserId = req.user.id;

        // 1. Check if both fields were provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current password and new password are required." });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different from the current password." });
        }

        // 2. Find the user in the database
        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 3. Verify the current password matches what is in the database
        if (user.password !== currentPassword) {
            return res.status(401).json({ message: "Incorrect current password." });
        }

        // 4. Update the password and save
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        res.status(500).json({ message: "Error changing password", error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { password } = req.body;
        const currentUserId = req.user.id;

        if (!password) {
            return res.status(400).json({ message: "Password is required to confirm account deletion." });
        }

        // Find the user
        const user = await User.findById(currentUserId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password. Deletion cancelled." });
        }

        // Delete after verification
        await User.findByIdAndDelete(currentUserId);

        // Cleanup  data
        await Group.updateMany(
            { members: currentUserId },
            { $pull: { members: currentUserId } }
        );

        await Group.deleteMany({ admin: currentUserId, members: { $size: 0 } });
        await Post.deleteMany({ author: currentUserId });

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};