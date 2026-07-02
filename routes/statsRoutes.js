const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/languages', auth, statsController.getLanguageStats);
router.get('/popular-groups', auth, statsController.getPopularGroups);

module.exports = router;