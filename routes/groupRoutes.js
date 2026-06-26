const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middlewares/auth');

// Main group routes
router.all('/', (req, res) => {
    switch (req.method) {
        case 'POST':
            return groupController.createGroup(req, res);
        case 'GET':
            return groupController.getAllGroups(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Routes for one specific group
router.all('/:id', auth, (req, res) => {
    switch (req.method) {
        case 'PUT':
            return groupController.updateGroup(req, res);
        case 'DELETE':
            return groupController.deleteGroup(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Add members to a specific group
router.all('/:id/members', auth, (req, res) => {
    switch (req.method) {
        case 'PATCH':
            return groupController.addGroupMembers(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Create a private conversation
router.post('/private', auth, groupController.createPrivate);

module.exports = router;