const { db, auth } = require('~/common/configs/firebase'); // Import Firestore and Firebase Auth from your config
const bcrypt = require('bcrypt');
const User = require('~/auth/models/User');
const { v4: uuidv4 } = require('uuid');
const { USERS } = require('~/common/utils/constants');

const UserService = {
  // Create a new user
  createUser: async function(userDTO) {
    try {
      // Step 1: Create a new instance of the User model
      const user = new User(
        null,
        userDTO.fullName || '',
        userDTO.phoneNumber || '',
        userDTO.dateOfBirth || '',
        userDTO.email || '',
        userDTO.urlImage || '',
        userDTO.password,
        userDTO.address || '',
        userDTO.city || '',
        userDTO.country || '',
        userDTO.school || '',
        userDTO.occupation || '',
        userDTO.favoriteProgrammingLanguage || '',
        new Date(), // createdAt
        new Date(), // updatedAt
        new Date(), // VIPExpDate (initially null)
        false, // isActive (initially true)
        true, // isFirstLogin (initially true)
        User.ERole.USER
      );

      // Step 2: Create the user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.fullName,
        disabled: !user.isActive,
      });

      try {
        // Step 3: Store the user in Firestore
        const userRef = db.collection(USERS).doc(userRecord.uid);

        await userRef.set({
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          email: user.email,
          urlImage: user.urlImage,
          address: user.address,
          city: user.city,
          country: user.country,
          school: user.school,
          occupation: user.occupation,
          favoriteProgrammingLanguage: user.favoriteProgrammingLanguage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          VIPExpDate: user.VIPExpDate,
          isActive: user.isActive,
          isFirstLogin: user.isFirstLogin,
          role: user.role,
        });

        console.log('User created and stored successfully:', userRecord.uid);
        return true;

      } catch (firestoreError) {
        console.error('Error storing user data in Firestore:', firestoreError.message);

        // Optionally, you could delete the user from Firebase Authentication since Firestore failed
        await auth.deleteUser(userRecord.uid);

        throw new Error('Error storing user data in Firestore');
      }

    } catch (error) {
      // Log the full error stack for better debugging
      console.error('Create user failed:', error.stack);
      throw new Error(`Create user failed: ${error.message}`);
    }
  },

  // Get a user's profile by their UID
  getProfile: async function(uid) {
    try {
      const user = await getUserByUid(uid); // Fetch the user from Firestore
      return user; // Return the user data
    } catch (error) {
      throw new Error(`Get profile failed: ${error.message}`);
    }
  },

  // Update a user's profile
  changeProfile: async function(uid, profileDTO) {
    try {
      const user = await getUserByUid(uid); // Fetch the user from Firestore

      // Update the user's properties
      if (profileDTO.fullName) user.fullName = profileDTO.fullName;
      if (profileDTO.phoneNumber) user.phoneNumber = profileDTO.phoneNumber;
      if (profileDTO.dateOfBirth) user.dateOfBirth = profileDTO.dateOfBirth;

      user.updatedAt = new Date(); // Update the `updatedAt` field

      // Save the updated user in Firestore
      await updateUser(user);

      return user; // Return the updated user
    } catch (error) {
      throw new Error(`Change profile failed: ${error.message}`);
    }
  },

  // Change a user's password
  changePassword: async function(uid, oldPassword, newPassword) {
    try {
      const user = await getUserByUid(uid); // Fetch the user from Firestore

      // Check if the old password matches
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Incorrect old password');
      }

      // Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.updatedAt = new Date(); // Update the updatedAt field

      // Save the updated user in Firestore
      await updateUser(user);

      // Update the password in Firebase Authentication
      await auth.updateUser(uid, { password: newPassword });

      return true;
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  }
};

// Utility Functions for Firestore Operations

// Save a user to Firestore
async function saveUser(user) {
  try {
    await db.collection(USERS).doc(user.id).set({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      urlImage: user.urlImage,
      password: user.password, // Store the hashed password
      address: user.address,
      city: user.city,
      country: user.country,
      school: user.school,
      occupation: user.occupation,
      favoriteProgrammingLanguage: user.favoriteProgrammingLanguage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      VIPExpDate: user.VIPExpDate,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin,
      role: user.role
    });
  } catch (error) {
    throw new Error(`Failed to save user: ${error.message}`);
  }
}

// Get a user by UID from Firestore
async function getUserByUid(uid) {
  try {
    const userDoc = await db.collection(USERS).doc(uid).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data(); // Return the user data
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
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
      updatedAt: user.updatedAt,
      VIPExpDate: user.VIPExpDate,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin,
      role: user.role
    });
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

module.exports = UserService;