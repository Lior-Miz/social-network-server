const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Define routes for posts
router.post('/', auth, upload.single('attachment'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.get('/search', postController.searchPosts);
router.get('/file/:filename', postController.getFile);

module.exports = router;