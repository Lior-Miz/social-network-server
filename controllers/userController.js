const User = require('../models/User');
const Group = require('../models/Group');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// register user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, dateOfBirth, gender, language } = req.body;
        // Missing fields entirely
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

        // User tried to bypass by typing spaces ("   ")
        if (!username.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ message: "Fields cannot be empty or contain only spaces." });
        }

        // Duplicates
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

        const io = req.app.get('io');
        if (io) {
            io.emit('new_user', savedUser);
        }

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

        // Missing fields entirely
        if (!email || !password) {
            // Empty strings or just spaces
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

exports.getAllUsers = async (req, res) => {
    try {
        const query = req.query.includeSelf === 'true' ? {} : { _id: { $ne: req.user.id } };
        const users = await User.find(query);

        const usersWithAge = users.map(user => {
            const userObj = user.toObject();
            userObj.age = calculateAge(user.dateOfBirth);
            return userObj;
        });

        res.status(200).json(usersWithAge);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { username, gender, language } = req.body;

        const updates = {};

        // Handle Username updates & edge cases
        if (username !== undefined) {
            if (!username.trim()) {
                return res.status(400).json({ message: "Username cannot be empty or blank." });
            }

            // Check if the new username is already taken
            const existingUser = await User.findOne({
                username: username.trim(),
                _id: { $ne: currentUserId } // Exclude the current user from the search
            });

            if (existingUser) {
                return res.status(400).json({ message: "Username is already taken." });
            }

            updates.username = username.trim();
        }


        if (gender !== undefined) updates.gender = gender;
        if (language !== undefined) updates.language = language;

        // Update the user 
        const updatedUser = await User.findByIdAndUpdate(
            currentUserId,
            { $set: updates },
            {
                new: true,           // Return the modified document rather than the old one
                runValidators: true 
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('update_user', updatedUser);
        }

        // clear and send the response
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                gender: updatedUser.gender,
                language: updatedUser.language
            }
        });

    } catch (err) {
        // Catch Mongoose-specific validation errors
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

        // check if both fields were provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current password and new password are required." });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different from the current password." });
        }

        // Find the user in the database
        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        //Verify the current password matches what is in the database
        if (user.password !== currentPassword) {
            return res.status(401).json({ message: "Incorrect current password." });
        }

        // Update the password and save
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

        // Ensure the user has provided their password for confirmation
        if (!password) {
            return res.status(400).json({ message: "Password is required to confirm account deletion." });
        }

        const trimmedPassword = password.trim();

        const existingUser = await User.findById(currentUserId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (existingUser.password !== trimmedPassword) {
            return res.status(401).json({ message: "Incorrect password. Deletion cancelled." });
        }

        const userGroups = await Group.find({ members: currentUserId });

        // If the user is an admin of any group chats, we need to handle that before deletion
        for (let group of userGroups) {
            if (group.isGroupChat && group.admin && group.admin.toString() === currentUserId) {
                const otherMembers = group.members.filter(m => m.toString() !== currentUserId);
                if (otherMembers.length > 0) {
                    const randomAdmin = otherMembers[Math.floor(Math.random() * otherMembers.length)];
                    group.admin = randomAdmin;
                    await group.save();
                }
            }
        }

        // Now that all tests pass, delete the user
        await User.findByIdAndDelete(currentUserId);

        // Remove the user from all groups and mark their private chats as deleted
        await Group.updateMany(
            { members: currentUserId, isGroupChat: false },
            {
                $set: {
                    name: "Deleted Chat",
                    isDeletedUserChat: true
                },
                $pull: { members: currentUserId }
            }
        );

        await Group.updateMany(
            { members: currentUserId, isGroupChat: true },
            { $pull: { members: currentUserId } }
        );

        // Remove any groups that now have zero members and any posts posted by the deleted user
        await Group.deleteMany({ members: { $size: 0 } });
        await Post.deleteMany({ author: currentUserId });

        const io = req.app.get('io');
        if (io) {
            io.emit('delete_user', currentUserId);
        }

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

// Helper function to calculate age from date of birth
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