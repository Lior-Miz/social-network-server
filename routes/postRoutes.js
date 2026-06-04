const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

// Define routes for posts
router.post('/', postController.createPost);       // Create
router.get('/', postController.getAllPosts);       // Read
router.put('/:id', postController.updatePost);     // Update
router.delete('/:id', postController.deletePost);  // Delete
router.get('/search', postController.searchPosts); // Search

module.exports = router;