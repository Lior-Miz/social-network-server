const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middlewares/auth');

router.post('/',auth, groupController.createGroup);       // create
router.get('/',groupController.getAllGroups);       // list 
//router.get('/:id', groupController.getGroupById);       // get group by id
router.put('/:id', auth, groupController.updateGroup);     // update
router.delete('/:id', auth, groupController.deleteGroup);  // delete
router.patch('/:id/members', auth, groupController.addGroupMembers); // update members of a group


router.post('/private', auth, groupController.createPrivate); // create private group between two people

module.exports = router;