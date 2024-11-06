class User {
  constructor(
    id,
    fullName,
    phoneNumber,
    dateOfBirth,
    email,
    urlImage,
    password,
    address,
    city,
    country,
    school,
    occupation,
    favoriteProgrammingLanguage,
    createdAt,
    updatedAt,
    VIPExpDate,
    isActive,
    isFirstLogin,
    role,
  ) {
    this.id = id
    this.fullName = fullName
    this.phoneNumber = phoneNumber
    this.dateOfBirth = dateOfBirth
    this.email = email
    this.urlImage = urlImage
    this.password = password
    this.address = address
    this.city = city
    this.country = country
    this.school = school
    this.occupation = occupation
    this.favoriteProgrammingLanguage = favoriteProgrammingLanguage
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.VIPExpDate = VIPExpDate
    this.isActive = isActive
    this.isFirstLogin = isFirstLogin
    this.role = role // ERole Enum: USER, USER_VIP, ADMIN
  }

  static ERole = {
    USER: 'USER',
    USER_VIP: 'USER_VIP',
    ADMIN: 'ADMIN',
  }
}

module.exports = User
