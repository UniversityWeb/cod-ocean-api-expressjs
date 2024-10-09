const UserService = require('~/login/services/UserService');
const User = require('~/login/models/User');
const { ResponseBuilder, MessageKeys } = require('~/login/utils/utils');

const handleError = (error, res) => {
  console.error(error);
  const errorMessage = error.message || 'An error occurred';
  const statusCode = error.code === '23505' ? 400 : 500; // Customize based on error types
  const response = ResponseBuilder.error({ message: errorMessage });
  return res.status(statusCode).json(response);
};

const UserController = {

  async createUser(req, res) {
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
      } = req.body;

      const user = new User(
        fullName,
        phoneNumber,
        dateOfBirth,
        email,
        urlImage,
        password,
        cumulativeScore,
        isActive,
        role
      );

      const userId = await UserService.createUser(user);

      const registerResponse = {
        message: MessageKeys.REGISTER_SUCCESSFULLY,
        user: { id: userId, ...user } // Optionally return the user details
      };

      return res.status(201).json(ResponseBuilder.success(registerResponse));
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getUserByEmail(req, res) {
    const { email } = req.params;
    try {
      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(404).json(ResponseBuilder.error({ message: 'User not found' }));
      }
      return res.status(200).json(ResponseBuilder.success(user));
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(ResponseBuilder.success(users));
    } catch (error) {
      return handleError(error, res);
    }
  },

  async login(req, res) {
    try {
      const { phoneNumber, password } = req.body;

      const token = await UserService.login(phoneNumber, password);
      return res.status(200).json(ResponseBuilder.success({ token }));
    } catch (error) {
      return handleError(error, res);
    }
  },
};

module.exports = UserController;