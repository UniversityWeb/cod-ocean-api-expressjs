const ResponseBuilder = {
  success: (data) => ({
    success: true,
    data,
  }),

  error: (errorDetails) => ({
    success: false,
    error: errorDetails,
  }),
};

const MessageKeys = {
  REGISTER_SUCCESSFULLY: "Register successfully",
  PHONE_NUMBER_ALREADY_EXISTS: "Phone number already exists",
  USER_NOT_FOUND: "User not found",
  ERROR_CREATING_USER: "Error creating user",
  ERROR_FETCHING_USER: "Error fetching user",
  LOGIN_SUCCESSFULLY: "Login successfully",
  LOGIN_FAILED: "Login failed",
  PASSWORD_NOT_MATCH: "Password does not match",
};

module.exports = { ResponseBuilder, MessageKeys };
