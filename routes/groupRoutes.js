const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/', groupController.createGroup);       // create
router.get('/', groupController.getAllGroups);       // read
router.put('/:id', groupController.updateGroup);     // update
router.delete('/:id', groupController.deleteGroup);  // delete

module.exports = router;