// models/User.js

class User {
  constructor(
    fullName,
    phoneNumber,
    dateOfBirth,
    email,
    urlImage,
    password,
    cumulativeScore,
    isActive,
    role,
  ) {
    this.fullName = fullName
    this.phoneNumber = phoneNumber
    this.dateOfBirth = dateOfBirth
    this.email = email
    this.urlImage = urlImage
    this.password = password
    this.cumulativeScore = cumulativeScore
    this.addedAt = new Date()
    this.updatedAt = new Date()
    this.isActive = isActive
    this.role = role
    this.notifications = []
    this.comments = []
    this.submissions = []
    this.ownedProblems = []
    this.contestEnrollments = []
    this.contests = []
    this.tokens = []
    this.discusses = []
  }
}

module.exports = User
