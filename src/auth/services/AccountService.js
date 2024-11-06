const { auth, db } = require('~/common/configs/firebase'); // Import Firestore and Firebase Auth from your config
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { USERS, TOKENS } = require('~/common/utils/constants'); // Assuming you have constants for Firestore collection names

const AccountService = {
  // Log in a user
  login: async function (email, password) {
    try {
      // Get user authentication record from Firebase Authentication
      const userRecord = await auth.getUserByEmail(email);

      // Fetch user data from Firestore
      const user = await getUserByEmail(email);

      // Check if the password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if it's the user's first login
      if (user.isFirstLogin) {
        user.isFirstLogin = false;
        await updateUser(user); // Update the user in Firestore
      }

      // Create a custom token for the user
      const token = await auth.createCustomToken(userRecord.uid);
      return token;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  // Change the user's password
  changePassword: async function (uid, oldPassword, newPassword) {
    try {
      // Fetch the user data from Firestore
      const user = await getUserByUid(uid);

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
      const user = await getUserByEmail(email);

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
      // Fetch the token record from Firestore
      const tokenRecord = await getTokenByToken(refreshToken);

      // Create a new custom token for the user
      const newToken = await auth.createCustomToken(tokenRecord.userId);
      return newToken;
    } catch (error) {
      throw new Error(`Refresh token failed: ${error.message}`);
    }
  }
};

// Utility Functions for Firestore Operations

// Fetch a user by email from Firestore
async function getUserByEmail(email) {
  try {
    const userQuery = await db.collection(USERS).where('email', '==', email).limit(1).get();
    if (userQuery.empty) {
      throw new Error('User not found');
    }
    const userDoc = userQuery.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
}

// Fetch a user by UID from Firestore
async function getUserByUid(uid) {
  try {
    const userDoc = await db.collection(USERS).doc(uid).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data();
  } catch (error) {
    throw new Error(`Failed to get user by UID: ${error.message}`);
  }
}

// Update a user in Firestore
async function updateUser(user) {
  try {
    await db.collection(USERS).doc(user.id).update({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      urlImage: user.urlImage,
      password: user.password, // Store the updated hashed password
      address: user.address,
      city: user.city,
      country: user.country,
      school: user.school,
      occupation: user.occupation,
      favoriteProgrammingLanguage: user.favoriteProgrammingLanguage,
      updatedAt: new Date(),
      VIPExpDate: user.VIPExpDate,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin,
      role: user.role
    });
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

// Invalidate tokens for the user (optional)
async function invalidateTokensForUser(uid) {
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
}

// Fetch a token by refresh token from Firestore
async function getTokenByToken(refreshToken) {
  try {
    const tokenQuery = await db.collection(TOKENS).where('token', '==', refreshToken).limit(1).get();
    if (tokenQuery.empty) {
      throw new Error('Token not found');
    }
    const tokenDoc = tokenQuery.docs[0];
    return { id: tokenDoc.id, ...tokenDoc.data() };
  } catch (error) {
    throw new Error(`Failed to get token: ${error.message}`);
  }
}

module.exports = AccountService;