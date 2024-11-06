class OTP {
  constructor(id, encryptedOTP, expirationDate, type, userId) {
    this.id = id; // Firestore will handle this ID if not provided
    this.encryptedOTP = encryptedOTP;
    this.expirationDate = expirationDate;
    this.type = type; // EType Enum: FORGOT_PASSWORD, ACTIVE_ACCOUNT, CHANGE_EMAIL
    this.userId = userId;
  }

  static EType = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    ACTIVE_ACCOUNT: 'ACTIVE_ACCOUNT',
    CHANGE_EMAIL: 'CHANGE_EMAIL'
  };
}

module.exports = OTP;