const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');

// Define routes for posts
router.post('/', auth, postController.createPost);       // Create
router.get('/', postController.getAllPosts);       // List
router.put('/:id', auth, postController.updatePost);     // Update
router.delete('/:id', auth, postController.deletePost);  // Delete
router.get('/search', postController.searchPosts); // Search

module.exports = router;