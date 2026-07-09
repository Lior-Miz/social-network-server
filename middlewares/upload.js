const multer = require('multer');
const path = require('path');

// Configure where and how the files are saved
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure an "uploads" folder exists in your root directory
    },
    filename: (req, file, cb) => {
        // Create a unique filename so uploads don't overwrite each other
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Create the upload middleware
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos/images
});

module.exports = upload;