const express = require('express')
const router = express.Router()
const userController = require('~/controllers/UserController')

router.post('/users', userController.createUser)

router.get('/users/:email', userController.getUserByEmail)

module.exports = router
