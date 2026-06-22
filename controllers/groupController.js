const group = require('../models/Group');


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
};