const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middlewares/auth');

// Main group routes
router.all('/', auth, (req, res) => {
    switch (req.method) {
        case 'POST':
            return groupController.createGroup(req, res);
        case 'GET':
            if (req.query.q) {
                return groupController.searchGroups(req, res);
            }
            return groupController.getAllGroups(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Create a private conversation
router.post('/private', auth, groupController.createPrivate);

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

// Leave a group
router.all('/:id/leave', auth, (req, res) => {
    switch (req.method) {
        case 'PATCH':
            return groupController.leaveGroup(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Join Request Routes
router.all('/:id/request-join', auth, (req, res) => {
    switch (req.method) {
        case 'POST':
            return groupController.requestJoinGroup(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

// Accept join request routes
router.all('/:id/accept-join', auth, (req, res) => {
    switch (req.method) {
        case 'POST':
            return groupController.acceptJoinRequest(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

//Reject join request routes
router.all('/:id/reject-join', auth, (req, res) => {
    switch (req.method) {
        case 'POST':
            return groupController.rejectJoinRequest(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
});

module.exports = router;