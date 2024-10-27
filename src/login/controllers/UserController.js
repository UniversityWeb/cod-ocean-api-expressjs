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
        addedAt,
        updatedAt,
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
        addedAt,
        updatedAt,
        true,
        role
      );

      const userDTO = await UserService.register(user);

      const registerResponse = {
        message: MessageKeys.REGISTER_SUCCESSFULLY,
        user: userDTO
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
      const { email, password } = req.body;

      const loginResponse = await UserService.login(email, password);
      return res.status(200).json(ResponseBuilder.success({ loginResponse }));
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getCurUser(req, res) {
    try {
      // Assuming the JwtTokenFilter middleware has already set req.currentUser
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const user = await UserService.getUserByUid(currentUser.uid);
      return res.status(200).json(ResponseBuilder.success({ user: user }));
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req, res) {
    try {
      const { uid } = req.params; // Extract user ID from URL parameters
      const updatedUserData = req.body; // Get the updated fields from the request body

      // Update the user using the UserService
      const updatedUser = await UserService.update(uid, updatedUserData);

      // Send the updated user data as a response
      return res.status(200).json({
        message: 'User updated successfully',
        data: updatedUser
      });

    } catch (error) {
      // Handle errors and send error response
      return res.status(400).json({
        message: `Error updating user: ${error.message}`
      });
    }
  },
};

module.exports = UserController;