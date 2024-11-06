const bcrypt = require('bcrypt');
const OTP = require('~/auth/models/OTP');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const secureRandom = require('crypto').randomInt;
const { db } = require('~/common/configs/firebase');

const OtpService = {
  requestOTP: async function(email, type) {
    const otpString = generateOtpString();
    const encryptedOTP = await bcrypt.hash(otpString, 10);
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Create OTP object
    const otp = new OTP(uuidv4(), encryptedOTP, expirationDate, type, email);

    // Save OTP to Firestore
    await saveOTP(otp);

    // Send OTP via email
    await sendEmail(email, otpString, type);
    return true;
  },

  verifyOTP: async function(email, otpString, type) {
    try {
      const otpRecord = await getOtpByEmailAndType(email, type); // Fetch OTP from Firestore

      if (!otpRecord) {
        throw new Error('OTP not found');
      }

      const isOtpValid = await bcrypt.compare(otpString, otpRecord.encryptedOTP);
      const isOtpExpired = new Date() > otpRecord.expirationDate;

      if (isOtpValid && !isOtpExpired) {
        // Invalidate the OTP after successful verification
        await invalidateOTP(otpRecord.id);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }
};

// Generate a random 6-digit OTP string
function generateOtpString() {
  return secureRandom(100000, 999999).toString();
}

// Function to send OTP via email using Nodemailer
async function sendEmail(to, otpString, type) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = type === OTP.EType.ACTIVE_ACCOUNT ? 'Activate your account' : 'Reset your password';
  const text = `Your OTP code is ${otpString}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
}

// Function to save OTP to Firestore
async function saveOTP(otp) {
  try {
    const otpRef = db.collection('otps').doc(otp.id); // Save OTP with id as document ID
    await otpRef.set({
      encryptedOTP: otp.encryptedOTP,
      expirationDate: otp.expirationDate,
      type: otp.type,
      userId: otp.userId
    });
  } catch (error) {
    throw new Error(`Failed to save OTP: ${error.message}`);
  }
}

// Function to fetch OTP by email and type from Firestore
async function getOtpByEmailAndType(email, type) {
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
}

// Function to invalidate (delete) an OTP after verification
async function invalidateOTP(otpId) {
  try {
    await db.collection('otps').doc(otpId).delete();
  } catch (error) {
    throw new Error(`Failed to invalidate OTP: ${error.message}`);
  }
}

module.exports = OtpService;