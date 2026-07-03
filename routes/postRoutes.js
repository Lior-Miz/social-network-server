const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Define routes for posts
router.post('/', auth, upload.single('attachment'), postController.createPost);       // Create
router.get('/',auth, postController.getAllPosts);       // List
router.put('/:id', auth, postController.updatePost);     // Update
router.delete('/:id', auth, postController.deletePost);  // Delete
router.get('/search', postController.searchPosts); // Search

module.exports = router;