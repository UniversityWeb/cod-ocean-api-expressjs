const db = require('~/configs/firebase')
const User = require('../models/User')

class UserService {
  static async save(user) {
    const userRef = db.collection('users').doc()
    await userRef.set({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      urlImage: user.urlImage,
      password: user.password,
      cumulativeScore: user.cumulativeScore,
      addedAt: user.addedAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      role: user.role,
      notifications: user.notifications,
      comments: user.comments,
      submissions: user.submissions,
      ownedProblems: user.ownedProblems,
      contestEnrollments: user.contestEnrollments,
      contests: user.contests,
      tokens: user.tokens,
      discusses: user.discusses,
    })
    return userRef.id
  }

  static async findByEmail(email) {
    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get()
    if (snapshot.empty) {
      return null
    }

    let userData = null
    snapshot.forEach((doc) => {
      userData = {id: doc.id, ...doc.data()}
    })
    return userData
  }
}

module.exports = UserService
