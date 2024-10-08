const UserService = require('~/login/services/UserService')
const User = require('~/login/models/User')

exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      dateOfBirth,
      email,
      urlImage,
      password,
      cumulativeScore,
      isActive,
      role,
    } = req.body

    const user = new User(
      fullName,
      phoneNumber,
      dateOfBirth,
      email,
      urlImage,
      password,
      cumulativeScore,
      isActive,
      role,
    )

    const userId = await UserService.save(user)

    res.status(201).json({id: userId, message: 'User created successfully'})
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Error creating user', error})
  }
}

exports.getUserByEmail = async (req, res) => {
  const {email} = req.params

  try {
    const user = await UserService.findByEmail(email)
    if (!user) {
      return res.status(404).json({message: 'User not found'})
    }
    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Error fetching user', error})
  }
}
