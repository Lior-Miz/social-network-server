const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/register', userController.registerUser); //register
router.post('/login', userController.loginUser); //login
router.post('/', userController.createUser); //create
router.get('/', userController.getAllUsers); //read
router.put('/:id', userController.updateUser); //update
router.delete('/:id', userController.deleteUser); // delete

module.exports = router;