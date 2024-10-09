const express = require('express')
const router = express.Router()
const helloRoutes = require('~/common/hello/helloRoutes')
const userRoutes = require('~/login/routes/userRoutes')

const API_SUFFIX = "/api";

router.use(`${API_SUFFIX}/hello`, helloRoutes)
router.use(`${API_SUFFIX}`, userRoutes)

module.exports = router
