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
    addedAt,
    updatedAt,
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
    this.addedAt = addedAt
    this.updatedAt = updatedAt
    this.isActive = isActive
    this.role = role
  }
}

module.exports = User
