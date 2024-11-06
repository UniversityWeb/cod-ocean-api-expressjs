const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { OTP_TYPES } = require('~/auth/utils/utils');
dotenv.config();

const EmailService = {
  // Initialize the transporter with Gmail configuration
  transporter: nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SENDING_EMAIL_ADDRESS, // sender email address from environment variable
      pass: process.env.SENDING_EMAIL_PASSWORD // sender email password from environment variable
    },
    tls: {
      rejectUnauthorized: false
    }
  }),

  // Send email with HTML content
  sendHtmlContent: async function(toEmail, subject, htmlBody) {
    try {
      const mailOptions = {
        from: process.env.SENDING_EMAIL_ADDRESS,
        to: toEmail,
        subject: subject,
        html: htmlBody
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send email');
    }
  },

  // Create HTML email content with OTP for activation or password reset
  createHtmlEmailContentWithOTP: function(otpString, type) {
    const typeString = type === OTP_TYPES.ACTIVE_ACCOUNT ? 'activate your account' : 'reset your password';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            margin-bottom: 20px;
          }
          .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Your OTP Code</h2>
          </div>
          <p>Hello,</p>
          <p>Here is your One-Time Password (OTP) to ${typeString}:</p>
          <p class="otp">${otpString}</p>
          <p>Please enter this OTP in the application to complete the process.</p>
          <div class="footer">
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = EmailService;
