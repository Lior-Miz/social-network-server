const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middlewares/auth');

router.post('/', groupController.createGroup);       // create
router.get('/', groupController.getAllGroups);       // read
router.put('/:id', groupController.updateGroup);     // update
router.delete('/:id', groupController.deleteGroup);  // delete


router.post('/private', auth, groupController.createPrivate); // create private group between two people

module.exports = router;