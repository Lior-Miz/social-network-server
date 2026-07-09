const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// Initialize S3 Client
console.log("=== AWS ENVIRONMENT VARIABLE CHECK ===");
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_ACCESS_KEY_ID exists?:", !!process.env.AWS_ACCESS_KEY_ID, process.env.AWS_ACCESS_KEY_ID === "undefined" ? "(Literal string 'undefined')" : "");
console.log("AWS_SECRET_ACCESS_KEY exists?:", !!process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_SECRET_ACCESS_KEY === "undefined" ? "(Literal string 'undefined')" : "");
console.log("AWS_SESSION_TOKEN exists?:", !!process.env.AWS_SESSION_TOKEN, process.env.AWS_SESSION_TOKEN === "undefined" ? "(Literal string 'undefined')" : "");
console.log("======================================");
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
    }
});

// Set up multer to use S3 for video and image attachments
const s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 } // Added the 50MB limit here for safety
});

// Define routes for posts - using s3Upload variable name
router.post('/', auth, s3Upload.single('attachment'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.get('/search', postController.searchPosts);

module.exports = router;