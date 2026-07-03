/*const group = require('../models/Group');

exports.createDirect = async (req, res) => {
    try {


        const { targetUserId } = req.body;
        const currentUserId = req.user._id;


        let new_group = await group.findOne({
            isGroupChat: false,
            members: { $all: [currentUserId, targetUserId] }
        }).populate('members', 'username email');
        
        if (new_group) {
            return res.status(200).json(new_group);
        }

        const newGroup  = new group({
            isGroupChat: false,
            name: "Direct Message",
            members: [currentUserId, targetUserId],
            admin: [currentUserId, targetUserId]
        });

        const savedGroup = await newGroup.save();

        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        res.status(201).json(populatedGroup);


    } catch (err) {
        res.status(500).json({ message: "Error creating direct message", error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {

        // Edge Case 1: Group name is missing or is just empty spaces
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required and cannot be empty." });
        }

        // Trim whitespace and save
        const newGroup = new Group({
            name: name.trim(),
            description: description ? description.trim() : "",
            admin
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);


    } catch (err) {
        // Edge Case 3: Catch Mongoose schema validation errors gracefully
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", error: err.message });
        }
        res.status(500).json({ message: "Error creating group", error: err.message });
    }

};

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);

    } catch (err) {
        res.status(500).json({ message: "Error fetching groups", error: err.message });
    }
};
exports.updateGroup = async (req, res) => {
    try {
        const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGroup) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json(updatedGroup);

    } catch (err) {
        res.status(500).json({ message: "Error updating group", error: err.message });
    }
};
exports.deleteGroup = async (req, res) => {
    try {
        const deletedGroup = await Group.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json({ message: "Group deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting group", error: err.message });
    }
};*/


const Group = require('../models/Group');
const User = require('../models/User');

exports.createPrivate = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({ message: "targetUserId is required" });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot start a private chat with yourself" });
        }

        let existingGroup = await Group.findOne({
            isGroupChat: false,
            members: { $all: [currentUserId, targetUserId], $size: 2 }
        }).populate('members', 'username email');

        if (existingGroup) {
            return res.status(200).json(existingGroup);
        }

        const newGroup = new Group({
            isGroupChat: false,


            name: "Private conversation",
            members: [currentUserId, targetUserId],
            admin: currentUserId
        });

        const savedGroup = await newGroup.save();

        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        const io = req.app.get('io');
        if (io) {
            io.emit('new_group', populatedGroup);
        }

        res.status(201).json(populatedGroup);

    } catch (err) {
        res.status(500).json({ message: "Error creating direct message", error: err.message });
    }
};

exports.addGroupMembers = async (req, res) => {
    try {
        const { userIds } = req.body;
        const currentUserId = req.user.id;
        const groupId = req.body.groupId || req.params.id;

        if (!groupId) {
            return res.status(400).json({ message: "Group id is required" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== currentUserId) {
            return res.status(403).json({ message: "Only the group admin can add members" });
        }

        const existingMemberIds = group.members.map(member => member.toString());
        const newMembers = userIds.filter(userId => !existingMemberIds.includes(userId.toString()));

        if (newMembers.length === 0) {
            return res.status(200).json({ message: "All selected users are already members", group });
        }

        group.members.push(...newMembers);
        const updatedGroup = await group.save();

        const populatedGroup = await Group.findById(updatedGroup._id).populate('members', 'username email');

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', populatedGroup);
        }

        res.status(200).json(populatedGroup);
    } catch (err) {
        res.status(500).json({ message: "Error adding group members", error: err.message });
    }
};

exports.leaveGroup = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const groupId = req.params.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Remove user from members
        group.members = group.members.filter(m => m.toString() !== currentUserId);

        if (group.admin && group.admin.toString() === currentUserId) {
            if (group.members.length > 0) {
                const randomMember = group.members[Math.floor(Math.random() * group.members.length)];
                group.admin = randomMember;
            } else {
                group.admin = null;
            }
        }

        const updatedGroup = await group.save();

        const populatedGroup = await Group.findById(updatedGroup._id).populate('members', 'username email');

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', populatedGroup);
        }

        res.status(200).json(populatedGroup);
    } catch (err) {
        res.status(500).json({ message: "Error leaving group", error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const currentUserId = req.user.id;

        // Edge Case 1: Group name is missing or is just empty spaces
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required and cannot be empty." });
        }

        // Combine current user and invited members, removing duplicates
        let memberIds = [currentUserId];
        if (members && Array.isArray(members)) {
            members.forEach(memberId => {
                if (memberId !== currentUserId && !memberIds.includes(memberId)) {
                    memberIds.push(memberId);
                }
            });
        }

        const newGroup = new Group({
            isGroupChat: true,
            name: name.trim(),
            description: description ? description.trim() : "",
            members: memberIds,
            admin: currentUserId
        });

        const savedGroup = await newGroup.save();

        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        // Update the groups array for all members
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $addToSet: { groups: savedGroup._id } }
        );

        const io = req.app.get('io');
        if (io) {
            io.emit('new_group', populatedGroup);
        }

        res.status(201).json(populatedGroup);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", error: err.message });
        }
        res.status(500).json({ message: "Error creating group", error: err.message });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        let filter = {};

        if (req.query.myGroups === 'true') {
            filter.members = req.user.id;
        }

        if (req.query.isGroupChat === 'true') {
            filter.isGroupChat = true; // MongoDB יחפש רק מסמכים שבהם השדה הזה הוא true
        }

        const groups = await Group.find(filter);
        res.status(200).json(groups);

    } catch (err) {
        res.status(500).json({ message: "Error fetching groups", error: err.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin && group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the group admin can update this group" });
        }

        const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', updatedGroup);
        }

        res.status(200).json(updatedGroup);

    } catch (err) {
        res.status(500).json({ message: "Error updating group", error: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const group = await Group.findById(req.params.id);

        if (group.admin.toString() !== currentUserId) {
            return res.status(403).json({ message: "Only the group admin can delete this group" });
        }

        const deletedGroup = await Group.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json({ message: "Group deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting group", error: err.message });
    }
};

exports.searchGroups = async (req, res) => {
    try {
        const query = req.query.q;
        const currentUserId = req.user.id;

        // Find users matching query to check admin names
        const matchingUsers = await User.find({ username: { $regex: query, $options: 'i' } }).select('_id');
        const adminIds = matchingUsers.map(u => u._id);

        const groups = await Group.find({
            isGroupChat: true,
            members: currentUserId,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { admin: { $in: adminIds } }
            ]
        });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.requestJoinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: "You are already a member" });
        }
        if (group.joinRequests && group.joinRequests.includes(req.user.id)) {
            return res.status(400).json({ message: "You already requested to join" });
        }

        group.joinRequests.push(req.user.id);
        const savedGroup = await group.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', savedGroup);
        }

        res.status(200).json({ message: "Join request sent", group: savedGroup });
    } catch (err) {
        res.status(500).json({ message: "Error requesting to join group", error: err.message });
    }
};

exports.acceptJoinRequest = async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the group admin can accept requests" });
        }

        group.joinRequests = group.joinRequests.filter(id => id.toString() !== userId);
        if (!group.members.includes(userId)) {
            group.members.push(userId);
        }
        
        const savedGroup = await group.save();
        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', populatedGroup);
        }

        res.status(200).json({ message: "Join request accepted", group: populatedGroup });
    } catch (err) {
        res.status(500).json({ message: "Error accepting join request", error: err.message });
    }
};

exports.rejectJoinRequest = async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the group admin can reject requests" });
        }

        group.joinRequests = group.joinRequests.filter(id => id.toString() !== userId);
        
        const savedGroup = await group.save();
        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        const io = req.app.get('io');
        if (io) {
            io.emit('update_group', populatedGroup);
        }

        res.status(200).json({ message: "Join request rejected", group: populatedGroup });
    } catch (err) {
        res.status(500).json({ message: "Error rejecting join request", error: err.message });
    }
};