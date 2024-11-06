const ResponseBuilder = {
  success: (data) => ({
    success: true,
    data,
  }),

  error: (errorDetails) => ({
    success: false,
    error: errorDetails,
  }),
}

function convertFirebaseDocToUser(firebaseDoc) {
  if (firebaseDoc === null) return null;

  const data = firebaseDoc.data();
  return {
    id: firebaseDoc.id, // Firebase document ID
    fullName: data.fullName || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    dateOfBirth: data.dateOfBirth || '',
    urlImage: data.urlImage || '',
    password: data.password || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || '',
    school: data.school || '',
    occupation: data.occupation || '',
    favoriteProgrammingLanguage: data.favoriteProgrammingLanguage || '',
    updatedAt: data.updatedAt || new Date(),
    VIPExpDate: data.VIPExpDate || '',
    isActive: data.isActive || true,
    isFirstLogin: data.isFirstLogin || false,
    role: data.role || 'USER',
  };
}

async function convertFirebaseDocToOtp(firebaseDoc) {
  if (firebaseDoc === null) return null;

  const data = firebaseDoc.data();
  return {
    id: firebaseDoc.id, // Document ID from Firestore
    encryptedOTP: data.encryptedOTP,
    expirationDate: data.expirationDate,
    type: data.type,
    userId: data.userId,
  }
}

async function convertFirebaseDocToToken(firebaseDoc) {
  if (firebaseDoc === null) return null;

  const data = firebaseDoc.data();
  return {
    id: firebaseDoc.id,
    token: data.token,
    userId: data.userId,
  }
}

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
}

module.exports = {
  ResponseBuilder,
  MessageKeys,
  convertFirebaseDocToOtp,
  convertFirebaseDocToToken,
  convertFirebaseDocToUser,
}
