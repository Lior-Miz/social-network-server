const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, group } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Post content is required and cannot be empty." });
        }

        const newPost = new Post({
            content: content,
            group: group,
            author: req.user.id 
        });
            
        const savedPost = await newPost.save();
        await savedPost.populate('author', 'username');
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: "Error creating post", error: err.message });
    }
};

// Fetch all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
};

// Update an existing post by ID
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('author', 'name');
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
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
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }
        
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
};
// Advanced search for posts using 3 parameters: keyword, author, and group
exports.searchPosts = async (req, res) => {
    try {
        // Extract search parameters from the URL query string
        const { keyword, author, group } = req.query;
        let searchQuery = {};

        // 1. Parameter 1: Filter by keyword inside the content (case-insensitive)
        if (keyword) {
            searchQuery.content = { $regex: keyword, $options: 'i' };
        }

        // 2. Parameter 2: Filter by a specific author ID
        if (author) {
            searchQuery.author = author;
        }

        // 3. Parameter 3: Filter by a specific group ID
        if (group) {
            searchQuery.group = group;
        }

        // Execute the search with all the filters combined
        const results = await Post.find(searchQuery)
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: "Error executing search", error: err.message });
    }
};