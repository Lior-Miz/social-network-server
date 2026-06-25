const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/auth'); // Assuming you have auth middleware

router.post('/', auth, messageController.sendMessage);
router.get('/:groupId', auth, messageController.getMessages);

module.exports = router;