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

exports.createPrivate = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id; 

        let existingGroup = await Group.findOne({
            isGroupChat: false,
            members: { $all: [currentUserId, targetUserId] }
        }).populate('members', 'username email');
        
        if (existingGroup) {
            return res.status(200).json(existingGroup);
        }

        const newGroup = new Group({
            isGroupChat: false,                

            /*// Example logic in your frontend component:
                const otherUser = group.members.find(m => m._id !== currentUserId);
                const displayTitle = otherUser ? otherUser.username : "Direct Message";*/


            name: "Private conversation",
            members: [currentUserId, targetUserId],
            admin: currentUserId
        });

        const savedGroup = await newGroup.save();

        const populatedGroup = await Group.findById(savedGroup._id).populate('members', 'username email');

        res.status(201).json(populatedGroup);

    } catch (err) {
        res.status(500).json({ message: "Error creating direct message", error: err.message });
    }
};

exports.createGroup = async (req, res) => {  //needs some work, change the isGroup from false to true, and check the members array
    try {
        const { name, description, admin } = req.body;
        const currentUserId = req.user.id; 
        // Edge Case 1: Group name is missing or is just empty spaces
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required and cannot be empty." });
        }

        let existingGroup = await Group.findOne({                                //added the check for existing group with the same name
            isGroupChat: true
            /*add group id or something*/ 
        }).populate('members', 'username email');  //check if correct

        if (existingGroup) {                                    // if a group with the same name already exists, return it instead of creating a new one
            return res.status(200).json(existingGroup);
        }

        const newGroup = new Group({                     // if not, create a new group
            isGroupChat: true,
            name: name.trim(),
            description: description ? description.trim() : "",
            members: [currentUserId],
            admin: admin
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
};