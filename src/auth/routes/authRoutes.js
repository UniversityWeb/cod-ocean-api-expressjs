const express = require('express');
const router = express.Router();
const authController = require('~/auth/controllers/authController');

const PREFIX_AUTH = "/auth/v1";
const PREFIX_USER = "/user";

// Authentication Routes
router.post(`${PREFIX_AUTH}/sign-up`, authController.signUp);
router.post(`${PREFIX_AUTH}/sign-in`, authController.signIn);
router.post(`${PREFIX_AUTH}/sign-out`, authController.signOut);
router.post(`${PREFIX_AUTH}/refresh-token`, authController.refreshToken);
router.get(`${PREFIX_AUTH}/request-otp`, authController.requestOtp);
router.post(`${PREFIX_AUTH}/verify-otp`, authController.verifyOtp);
router.post(`${PREFIX_AUTH}/change-password`, authController.changePassword);
router.post(`${PREFIX_AUTH}/forgot-password`, authController.forgotPassword);

// User Routes
router.get(`${PREFIX_USER}/current`, authController.getCurrentUser);

module.exports = router;