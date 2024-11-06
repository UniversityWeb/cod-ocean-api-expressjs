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
  LOGIN_SUCCESSFULLY: 'user.login.login_successfully',
  REGISTER_SUCCESSFULLY: 'user.login.register_successfully',
  REGISTER_FAILED: 'user.login.register_failed',

  LOGIN_FAILED: 'user.login.login_failed',
  PASSWORD_NOT_MATCH: 'user.register.password_not_match',
  USER_IS_LOCKED: 'user.login.user_is_locked',
  AUTH_ALREADY_EXISTS: 'user.login.auth_already_exists',
  REFRESH_TOKEN_FAILED: 'user.login.refresh_access_token_failed',
  REFRESH_TOKEN_SUCCESSFUL: 'user.login.refresh_access_token_successful',
  REFRESH_PASSWORD_SUCCESSFUL: 'user.login.refresh_password_successful',
  REFRESH_PASSWORD_FAILED: 'user.login.refresh_password_failed',
  CAPTURE_PAYPAL_SUCCESSFUL: 'paypal.capture.successful',
  CAPTURE_PAYPAL_FAILED: 'paypal.capture.failed',
};

module.exports = { ResponseBuilder, MessageKeys };
