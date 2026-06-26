const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', userController.registerUser); //register
router.post('/login', userController.loginUser); //login
router.post('/', userController.createUser); //create
router.get('/', userController.getAllUsers); //read
router.put('/:id',auth, userController.updateUser); //update
router.delete('/:id', auth, userController.deleteUser); // delete

module.exports = router;