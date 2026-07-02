const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', userController.registerUser); //register
router.post('/login', userController.loginUser); //login
router.get('/', auth, userController.getAllUsers); //read
router.put('/change-password', auth, userController.changePassword); //change password
router.put('/:id', auth, userController.updateUser); //update
router.delete('/:id', auth, userController.deleteUser); // delete


module.exports = router;