const { db } = require('~/common/configs/firebase');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { TOKENS } = require('~/common/utils/constants');
const { convertFirebaseDocToToken } = require('~/auth/utils/utils'); // Assuming you have constants for Firestore collection names
const UserService = require('~/auth/services/UserService');
const {generateToken, extractEmail, generateRefreshToken} = require('~/auth/utils/jwtUtils');
const TokenService = require('~/auth/services/TokenService');
const Token = require('~/auth/models/Token');

const AccountService = {
  // Log in a user
  login: async function (email, password) {
    try {
      // Fetch user data from Firestore
      const user = await UserService.getUserByEmail(email);
      if (user === null) {
        throw new Error('User not found!');
      }

      const hashedPassword = user?.password;
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if it's the user's first login
      if (user.isFirstLogin) {
        user.isFirstLogin = false;
        await UserService.updateUser(user); // Update the user in Firestore
      }

      // Create a custom token for the user
      const token = generateToken(user);
      return token;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  // Change the user's password
  changePassword: async function (uid, oldPassword, newPassword) {
    try {
      // Fetch the user data from Firestore
      const user = await UserService.getUserByUid(uid);

      // Validate the old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Incorrect old password');
      }

      // Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await updateUser(user); // Update the user in Firestore

      // Optionally, invalidate the old tokens
      await invalidateTokensForUser(uid);
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  },

  // Reset the user's password (via email)
  resetPassword: async function (email, newPassword) {
    try {
      // Fetch the user data from Firestore
      const user = await UserService.getUserByEmail(email);

      // Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await updateUser(user); // Update the user in Firestore

      // Optionally, invalidate the old tokens
      await invalidateTokensForUser(user.id);
    } catch (error) {
      throw new Error(`Reset password failed: ${error.message}`);
    }
  },

  // Refresh an expired token
  refreshToken: async function (refreshToken) {
    try {
      const tokenRecord = await this.getTokenByToken(refreshToken);
      const user = await UserService.getUserByUid(tokenRecord?.userId);
      return generateToken(user);
    } catch (error) {
      throw new Error(`Refresh token failed: ${error.message}`);
    }
  },

  generateAndSaveRefreshToken: async function (accessToken) {
    const email = extractEmail(accessToken);
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error('User not found!');

    const refreshToken = generateRefreshToken(accessToken);
    await TokenService.createOrUpdateToken(user?.id, refreshToken);

    return refreshToken;
  },

  invalidateTokensForUser: async function(uid) {
    try {
      // Delete all tokens for the user from Firestore (optional token management)
      const tokenSnapshot = await db.collection(TOKENS).where('userId', '==', uid).get();
      const batch = db.batch();
      tokenSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to invalidate tokens: ${error.message}`);
    }
  },

  getTokenByToken: async function(refreshToken) {
    try {
      const tokenQuery = await db.collection(TOKENS).where('token', '==', refreshToken).limit(1).get();
      if (tokenQuery.empty) {
        throw new Error('Token not found');
      }
      const tokenDoc = tokenQuery.docs[0];
      return convertFirebaseDocToToken(tokenDoc);
    } catch (error) {
      throw new Error(`Failed to get token: ${error.message}`);
    }
  },
};

module.exports = AccountService;