const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, group } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Post content is required and cannot be empty." });
        }

        const newPostData = {
            content: content,
            group: group,
            author: req.user.id
        };

        // Handle image and video attachment if present
        if (req.file) {
            newPostData.attachmentUrl = req.file.path; 
            if (req.file.mimetype.startsWith('video/')) { // Check if the uploaded file is a video
                newPostData.attachmentType = 'video';
            } else if (req.file.mimetype.startsWith('image/')) { // Check if the uploaded file is an image
                newPostData.attachmentType = 'image';
            }
        }

        const newPost = new Post(newPostData);
        const savedPost = await newPost.save();

        // Replace default author and group fields id's with actual database objects
        await savedPost.populate('author', 'username');
        await savedPost.populate('group', 'name isGroupChat');

        // Socket.io broadcasts to the group room that a new post has been created in realtime
        const io = req.app.get('io');
        if (io) {
            io.to(group.toString()).emit('new_post', savedPost);
        }

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: "Error creating post", error: err.message });
    }
};



// Fetch all posts
exports.getAllPosts = async (req, res) => {
    try {
        // place holders for the public_group and my_feed
        const PUBLIC_GROUP_ID = "000000000000000000000000";
        const MY_FEED_ID = "111111111111111111111111";

        let groupFilter;
        if (req.query.group && req.query.group !== PUBLIC_GROUP_ID && req.query.group !== MY_FEED_ID) {
            groupFilter = { group: req.query.group }; //If a specific standard group ID is provided, fetch posts only for that group
        } else if (req.query.group === MY_FEED_ID) { // Look up every group the user has joined
            // Find all groups this user is a member of
            const Group = require('../models/Group');
            const userGroups = await Group.find({ members: req.user.id });
            const groupIds = userGroups.map(g => g._id);
            groupIds.push(PUBLIC_GROUP_ID); //Include public posts alongside private group posts

            groupFilter = { group: { $in: groupIds } };
        } else {
            groupFilter = { group: PUBLIC_GROUP_ID };
        }

        const posts = await Post.find(groupFilter)
            .sort({ createdAt: -1 }) // sort in descending order so the newest posts appear first
            .populate('author', 'username')
            .populate('group', 'name isGroupChat');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing post by ID
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        //Prevent users from editing posts that they did not make
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        //forces Mongoose to return the newly updated document instead of the old one
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('author', 'username');
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Socket.io broadcasts to the group room that a post has been updated in realtime
        const io = req.app.get('io');
        if (io && updatedPost.group) {
            io.to(updatedPost.group.toString()).emit('update_post', updatedPost);
        }

        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: "Error updating post", error: err.message });
    }
};

// Delete a post by ID
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        let isAdmin = false;
        // Check if the post belongs to a custom group (not the global public feed)
        if (post.group && post.group.toString() !== "000000000000000000000000") {
            const Group = require('../models/Group');
            const groupInfo = await Group.findById(post.group);
            // Determine if the user attempting the deletion is the admin of the group
            if (groupInfo && groupInfo.admin && groupInfo.admin.toString() === req.user.id) {
                isAdmin = true;
            }
        }

        //The user must either be the original author OR the group admin to delete the post
        if (post.author.toString() !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);

        const io = req.app.get('io');
        if (io && post.group) {
            io.to(post.group.toString()).emit('delete_post', req.params.id);
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
};

// Advanced search for posts using 3 parameters
exports.searchPosts = async (req, res) => {
    try {
        // Extract search parameters from the URL query string
        const { keyword, author, group } = req.query;
        let searchQuery = {};

        // Filter by keyword
        if (keyword) {
            searchQuery.content = { $regex: keyword, $options: 'i' };
        }

        // Filter by a specific author ID
        if (author) {
            searchQuery.author = author;
        }

        // Filter by a specific group ID
        if (group) {
            searchQuery.group = group;
        }

        // Search with all the filters combined
        const results = await Post.find(searchQuery)
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: "Error executing search", error: err.message });
    }
};