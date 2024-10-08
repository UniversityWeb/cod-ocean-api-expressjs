const express = require('express')
const router = express.Router()

const userRoutes = require('~/routes/userRoutes')

router.use('/hello', helloRoutes)
router.use('/users', userRoutes)

module.exports = router
