const { db, auth } = require('~/common/configs/firebase');
const User = require('~/login/models/User');
const { hashPassword, comparePassword } = require('~/login/utils/passwordUtils');
const { ResponseBuilder, MessageKeys } = require('~/login/utils/utils');
const jwt = require('jsonwebtoken');
const { USERS } = require('~/common/utils/constants');
const secretKey = process.env.JWT_SECRET_KEY;

const UserService = {
  async createUser(userDTO) {
    const existingUser = await this.findByPhoneNumber(userDTO.phoneNumber);
    if (existingUser) {
      throw new Error(MessageKeys.PHONE_NUMBER_ALREADY_EXISTS);
    }

    userDTO.password = await hashPassword(userDTO.password);

    const userRef = db.collection(USERS).doc();
    await userRef.set({
      fullName: userDTO.fullName,
      phoneNumber: userDTO.phoneNumber,
      dateOfBirth: userDTO.dateOfBirth,
      email: userDTO.email,
      urlImage: userDTO.urlImage,
      password: userDTO.password,
      cumulativeScore: userDTO.cumulativeScore,
      addedAt: userDTO.addedAt,
      updatedAt: userDTO.updatedAt,
      isActive: userDTO.isActive,
      role: userDTO.role,
      notifications: userDTO.notifications,
      comments: userDTO.comments,
      submissions: userDTO.submissions,
      ownedProblems: userDTO.ownedProblems,
      contestEnrollments: userDTO.contestEnrollments,
      contests: userDTO.contests,
      tokens: userDTO.tokens,
      discusses: userDTO.discusses,
    });
    return userRef.id;
  },

  async findByEmail(email) {
    const snapshot = await db.collection(USERS).where('email', '==', email).get();
    if (snapshot.empty) {
      return null;
    }

    let userData = null;
    snapshot.forEach((doc) => {
      userData = { id: doc.id, ...doc.data() };
    });
    return userData;
  },

  async findByPhoneNumber(phoneNumber) {
    const snapshot = await db.collection(USERS).where('phoneNumber', '==', phoneNumber).get();
    if (snapshot.empty) {
      return null;
    }

    let userData = null;
    snapshot.forEach((doc) => {
      userData = { id: doc.id, ...doc.data() };
    });
    return userData;
  },

  async getUserById(userId) {
    const snapshot = await db.collection(USERS).doc(userId).get();
    if (!snapshot.exists) {
      throw new Error(MessageKeys.USER_NOT_FOUND);
    }
    return { id: snapshot.id, ...snapshot.data() };
  },

  async getAllUsers() {
    const snapshot = await db.collection(USERS).get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  },

  async login(phoneNumber, password) {
    const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    if (!userRecord || !await comparePassword(password, userRecord.password)) {
      throw new Error(MessageKeys.LOGIN_FAILED);
    }

    const user = await auth.verifyIdToken(userRecord);
    // Logic for generating a token can go here
    const token = this.generateToken(userRecord);
    return token;
  },

  async register(email, password) {
    try {
      const userRecord = await auth.createUser({
        email: email,
        password: password
      });

      const token = this.generateToken(userRecord); // Assuming you want to generate a token

      return {
        user: userRecord,
        token: token
      };

    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  },

  generateToken(user) {
    const payload = {
      uid: user.uid,
      email: user.email,
    };

    return jwt.sign(payload, secretKey, { expiresIn: '1d' });
  }
};

module.exports = UserService;