const UserService = require('~/auth/services/UserService');
const AccountService = require('~/auth/services/AccountService');
const OTPService = require('~/auth/services/OTPService');
const { ResponseBuilder, MessageKeys } = require('~/auth/utils/utils');

const handleError = (error, res) => {
  console.error(error);
  const errorMessage = error.message || 'An error occurred';
  const statusCode = error.code === '23505' ? 400 : 500;
  const response = ResponseBuilder.error({ message: errorMessage });
  return res.status(statusCode).json(response);
};

const authController = {
  // Sign-Up Controller
  async signUp(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      const message = result ? MessageKeys.REGISTER_SUCCESSFULLY : MessageKeys.REGISTER_FAILED;
      res.status(200).json({ message });
    } catch (error) {
      const message = error.code === 'ER_DUP_ENTRY' ? MessageKeys.AUTH_ALREADY_EXISTS : error.message;
      res.status(400).json({ message });
    }
  },

  // Sign-In Controller
  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const accessToken = await AccountService.login(email, password);
      const refreshToken = await AccountService.generateAndSaveRefreshToken(accessToken);
      const user = await UserService.getUserDetailsFromToken(accessToken);

      res.status(200).json({
        message: MessageKeys.LOGIN_SUCCESSFULLY,
        refreshToken,
        accessToken,
        isActive: user.isActive,
        isFirstLogin: user.isFirstLogin,
        role: user.role
      });
    } catch (error) {
      const message = error.name === 'BadCredentialsError' ? MessageKeys.PASSWORD_NOT_MATCH : MessageKeys.LOGIN_FAILED;
      res.status(400).json({ message });
    }
  },

  // Sign-Out Controller
  async signOut(req, res) {
    const refreshToken = req.headers['authorization'];
    if (refreshToken) {
      await AccountService.deleteRefreshToken(refreshToken);
    }
    res.sendStatus(200);
  },

  // Refresh Token Controller
  async refreshToken(req, res) {
    try {
      const refreshToken = req.headers['authorization'];
      const newAccessToken = await AccountService.refreshToken(refreshToken);
      res.status(200).json({
        accessToken: newAccessToken,
        message: MessageKeys.REFRESH_TOKEN_SUCCESSFUL
      });
    } catch (error) {
      res.status(400).json({ message: MessageKeys.REFRESH_TOKEN_FAILED });
    }
  },

  // Request OTP Controller
  async requestOtp(req, res) {
    const { email } = req.query;
    const token = req.headers['authorization'];
    let isSuccessful = false;

    if (token) {
      const type = email ? 'CHANGE_EMAIL' : 'ACTIVE_ACCOUNT';
      isSuccessful = await OTPService.requestOTP(token, type);
    } else if (email) {
      isSuccessful = await OTPService.requestOTP(email, 'FORGOT_PASSWORD');
    }

    res.sendStatus(isSuccessful ? 201 : 400);
  },

  // Verify OTP Controller
  async verifyOtp(req, res) {
    const { otp } = req.body;
    const token = req.headers['authorization'];
    const isSuccessful = token && await OTPService.verify(token, otp, 'ACTIVE_ACCOUNT');

    res.sendStatus(isSuccessful ? 201 : 400);
  },

  // Change Password Controller
  async changePassword(req, res) {
    const bearerToken = req.headers['authorization'];
    if (!bearerToken) {
      return res.status(403).json({ message: "Permission deny!" });
    }

    try {
      await AccountService.changePassword(bearerToken, req.body);
      res.sendStatus(200);
    } catch (error) {
      const message = error.name === 'BadCredentialsError' ? MessageKeys.PASSWORD_NOT_MATCH : "Server error";
      res.status(error.name === 'BadCredentialsError' ? 400 : 500).json({ message });
    }
  },

  // Forgot Password Controller
  async forgotPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    try {
      const isVerified = await OTPService.verify(email, otp, 'FORGOT_PASSWORD');
      if (isVerified) {
        const message = await AccountService.resetPassword(email, newPassword);
        res.status(200).json({ message });
      } else {
        res.status(400).json({ message: MessageKeys.REFRESH_PASSWORD_FAILED });
      }
    } catch (error) {
      res.sendStatus(500);
    }
  },

  // Get Current User Controller
  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await AccountService.getUserDetailsFromToken(token);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user", error: error.message });
    }
  },
};

module.exports = authController;