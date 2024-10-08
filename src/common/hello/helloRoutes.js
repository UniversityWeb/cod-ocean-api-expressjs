const express = require('express')
const router = express.Router()
const {sayHello} = require('~/common/hello/HelloController')

router.get('/', sayHello)

module.exports = router
