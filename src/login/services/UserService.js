const { db, auth } = require('~/common/configs/firebase');
const { hashPassword, comparePassword } = require('~/login/utils/passwordUtils');
const { MessageKeys } = require('~/login/utils/utils');
const { USERS } = require('~/common/utils/constants');
const User = require('~/login/models/User');

const UserService = {
  async register(user) {
    try {
      // Check for existing user by phone number
      const existingUser = await this.findByPhoneNumber(user.phoneNumber);
      if (existingUser) {
        throw new Error(MessageKeys.PHONE_NUMBER_ALREADY_EXISTS);
      }

      // Create user account in Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
      });

      user.password = await hashPassword(user.password);

      // Use the uid from userRecord
      const userRef = db.collection(USERS).doc(userRecord.uid);
      await userRef.set({ ...user });

      // Return the saved user information
      return {
        uid: userRecord.uid,
        ...user,
      };

    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  },

  async findByEmail(email) {
    const snapshot = await db.collection(USERS).where('email', '==', email).get();
    if (snapshot.empty) {
      return null;
    }

    let userData = null;
    snapshot.forEach((doc) => {
      userData = this.convertDocToUser(doc);
    });
    return userData;
  },

  async getAllUsers() {
    const snapshot = await db.collection(USERS).get();
    const users = [];

    snapshot.forEach((doc) => {
      const user = this.convertDocToUser(doc);
      users.push({ id: doc.id, ...user });
    });

    return users;
  },

  async login(email, password) {
    try {
      // Sign in the user with email and password
      const userRecord = await auth.getUserByEmail(email);

      // Assuming you have a function to compare the plain password with the hashed password
      const userDoc = await db.collection(USERS).doc(userRecord.uid).get();

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();

      // Verify password (you need to implement comparePassword)
      const isPasswordValid = await comparePassword(password, userData.password);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      // Generate custom token if needed or return Firebase token
      const token = await auth.createCustomToken(userRecord.uid);

      // Create the LoginResponse object
      const loginResponse = {
        token: token,
        message: "Login successful",
        user: {
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          email: userData.email,
          urlImage: userData.urlImage,
          cumulativeScore: userData.cumulativeScore,
          role: userData.role,
        },
      };

      return loginResponse;

    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  async getUserByUid(uid) {
    try {
      const userRef = db.collection(USERS).doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = this.convertDocToUser(userDoc);

      return {
        id: userDoc.id,
        ...userData
      };
    } catch (error) {
      throw error;
    }
  },

  async update(uid, updatedUserData) {
    try {
      // Check if the user exists in Firestore
      const userRef = db.collection(USERS).doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      // Fetch existing user data
      const existingUserData = userDoc.data();

      // Update Firebase Auth if needed
      if (updatedUserData.email && updatedUserData.email !== existingUserData.email) {
        await auth.updateUser(uid, { email: updatedUserData.email });
      }
      if (updatedUserData.password) {
        const hashedPassword = await hashPassword(updatedUserData.password);
        updatedUserData.password = hashedPassword;
        await auth.updateUser(uid, { password: updatedUserData.password });
      }

      // Create an object with only valid User fields for Firestore update
      const userFields = Object.keys(new User());  // Get User class fields
      const dataToUpdate = {};
      for (const key in updatedUserData) {
        if (userFields.includes(key)) {
          dataToUpdate[key] = updatedUserData[key];
        }
      }

      // Set the updatedAt field
      dataToUpdate.updatedAt = new Date();

      // Update Firestore document
      await userRef.update(dataToUpdate);

      // Return updated data
      return {
        id: uid,
        ...existingUserData,
        ...dataToUpdate
      };

    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  async convertDocToUser(doc) {
    const data = doc.data();

    return new User(
      data.fullName,
      data.phoneNumber,
      data.dateOfBirth,
      data.email,
      data.urlImage,
      data.password,
      data.cumulativeScore,
      data.addedAt ? data.addedAt.toDate().toISOString() : null,
      data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
      data.isActive,
      data.role
    );
  }
};

module.exports = UserService;