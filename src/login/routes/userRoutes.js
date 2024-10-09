const express = require('express');
const router = express.Router();
const userController = require('~/login/controllers/UserController');

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.get('/users', userController.getAllUsers);
router.get('/get-users-by-email/:email', userController.getUserByEmail);

module.exports = router;
