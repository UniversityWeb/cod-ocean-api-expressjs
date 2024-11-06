const bcrypt = require('bcrypt');
const OTP = require('~/auth/models/OTP');
const { v4: uuidv4 } = require('uuid');
const { db } = require('~/common/configs/firebase');
const {generateOtpString, OTP_TYPES } = require('~/auth/utils/utils');
const EmailService = require('~/common/services/EmailService');

const OtpService = {
  requestOTP: async function(email, type) {
    const otpString = generateOtpString();
    const encryptedOTP = await bcrypt.hash(otpString, 10);
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Create OTP object
    const otp = new OTP(uuidv4(), encryptedOTP, expirationDate, type, email);

    // Save OTP to Firestore
    await this.saveOTP(otp);

    // Send OTP via email
    await this.sendEmail(email, otpString, type);
    return true;
  },

  verify: async function(email, otpString, type) {
    try {
      const otpRecord = await this.getOtpByEmailAndType(email, type); // Fetch OTP from Firestore

      if (!otpRecord) {
        throw new Error('OTP not found');
      }

      const isOtpValid = await bcrypt.compare(otpString, otpRecord.encryptedOTP);
      const isOtpExpired = new Date() > otpRecord.expirationDate;

      if (isOtpValid && !isOtpExpired) {
        // Invalidate the OTP after successful verification
        await this.invalidateOTP(otpRecord.id);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  },

  saveOTP: async function(otp) {
    try {
      const otpRef = db.collection('otps').doc(otp.id); // Save OTP with id as document ID
      await otpRef.set({
        encryptedOTP: otp.encryptedOTP,
        expirationDate: otp.expirationDate,
        type: otp.type,
        userId: otp.userId,
      });
    } catch (error) {
      throw new Error(`Failed to save OTP: ${error.message}`);
    }
  },

  getOtpByEmailAndType: async function(email, type) {
    try {
      const otpQuery = await db.collection('otps')
        .where('userId', '==', email)
        .where('type', '==', type)
        .limit(1)
        .get();

      if (otpQuery.empty) {
        return null;
      }

      const otpDoc = otpQuery.docs[0];
      return { id: otpDoc.id, ...otpDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get OTP: ${error.message}`);
    }
  },

  invalidateOTP: async function(otpId) {
    try {
      await db.collection('otps').doc(otpId).delete();
    } catch (error) {
      throw new Error(`Failed to invalidate OTP: ${error.message}`);
    }
  },

  sendEmail: async function(email, otpString, type) {
    const subject = type === OTP_TYPES.ACTIVE_ACCOUNT
      ? 'This is your OTP to activate your account'
      : 'This is your OTP to reset your password';

    const htmlEmail = EmailService.createHtmlEmailContentWithOTP(otpString, type);

    try {
      await EmailService.sendHtmlContent(email, subject, htmlEmail);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }
};

module.exports = OtpService;