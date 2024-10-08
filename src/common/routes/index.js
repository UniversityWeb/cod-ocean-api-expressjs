const express = require('express')
const router = express.Router()

const helloRoutes = require('~/common/hello/helloRoutes')
const userRoutes = require('~/login/routes/userRoutes')

router.use('/hello', helloRoutes)
router.use('/users', userRoutes)

module.exports = router
