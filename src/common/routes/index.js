const express = require('express')
const router = express.Router()
const helloRoutes = require('~/common/hello/helloRoutes')
const authRoutes = require('~/auth/routes/authRoutes')

const API_SUFFIX = "/api";

router.use(`${API_SUFFIX}/hello`, helloRoutes)
router.use(`${API_SUFFIX}`, authRoutes)

module.exports = router
