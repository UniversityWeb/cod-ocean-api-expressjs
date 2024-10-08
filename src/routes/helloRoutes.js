const express = require('express')
const router = express.Router()
const {sayHello} = require('~/controllers/HelloController')

router.get('/', sayHello)

module.exports = router
