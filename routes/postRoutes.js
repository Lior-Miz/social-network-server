const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Set up custom Multer storage engine to stream files to GridFS
class GridFSStorage {
    constructor(opts) {
        this.bucketName = opts.bucketName || 'uploads';
    }
    
    _handleFile(req, file, cb) {
        if (!mongoose.connection.db) {
            return cb(new Error("Database not connected"));
        }
        
        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: this.bucketName });
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname;
        
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype
        });
        
        file.stream.pipe(uploadStream)
            .on('error', cb)
            .on('finish', () => {
                cb(null, {
                    filename: filename,
                    id: uploadStream.id,
                    size: uploadStream.length
                });
            });
    }
    
    _removeFile(req, file, cb) {
        if (file.id && mongoose.connection.db) {
            const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: this.bucketName });
            bucket.delete(file.id, cb);
        } else {
            cb(null);
        }
    }
}

const storage = new GridFSStorage({ bucketName: 'uploads' });

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Define routes for posts
router.post('/', auth, upload.single('attachment'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.get('/search', postController.searchPosts);
router.get('/file/:filename', postController.getFile);

module.exports = router;