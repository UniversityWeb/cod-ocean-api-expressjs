const express = require('express');
const router = express.Router();
const userController = require('~/login/controllers/UserController');
const JwtTokenFilter = require('~/common/security/JwtTokenFilter');

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.get('/users', userController.getAllUsers);
router.get('/users/get-users-by-email/:email', userController.getUserByEmail);
router.get('/users/get-cur-user', JwtTokenFilter, userController.getCurUser);
router.post('/users/update/:uid', userController.update);

module.exports = router;
