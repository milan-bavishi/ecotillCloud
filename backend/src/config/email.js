const nodemailer = require('nodemailer');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address
 * @param {String} options.subject - Email subject
 * @param {String} options.html - Email HTML content
 * @returns {Promise} Nodemailer info response
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `EcoSattva <${process.env.MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generate a random OTP
 * @param {Number} length - Length of OTP
 * @returns {String} Random OTP
 */
const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Send OTP verification email
 * @param {String} email - Recipient email address
 * @param {String} name - Recipient name
 * @param {String} otp - OTP code
 * @returns {Promise} Email info
 */
const sendOTPEmail = async (email, name, otp) => {
  const subject = 'Verify Your EcoSattva Account';
  
  // Email template with OTP
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .email-container {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
        }
        .header {
          background-color: #1a5d1a;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          color: #1a5d1a;
          letter-spacing: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>EcoSattva Email Verification</h2>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          
          <p>Thank you for signing up with EcoSattva! To complete your registration, please verify your email address by entering the following One-Time Password (OTP):</p>
          
          <div class="otp-code">${otp}</div>
          
          <p>This code will expire in 10 minutes for security reasons. If you did not request this verification, please ignore this email.</p>
          
          <p>Regards,<br>The EcoSattva Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EcoSattva. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

/**
 * Send password reset email with reset link
 * @param {String} email - Recipient email address
 * @param {String} name - Recipient name
 * @param {String} resetToken - Password reset token
 * @param {String} resetUrl - Complete reset URL with token
 * @returns {Promise} Email info
 */
const sendPasswordResetEmail = async (email, name, resetToken, resetUrl) => {
  const subject = 'Reset Your EcoSattva Password';
  
  // Email template with reset link
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .email-container {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
        }
        .header {
          background-color: #1a5d1a;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          background-color: #1a5d1a;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .token {
          margin: 20px 0;
          padding: 10px;
          background-color: #f4f4f4;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>EcoSattva Password Reset</h2>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          
          <p>We received a request to reset your password for your EcoSattva account. Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste the following URL into your browser:</p>
          
          <div class="token">
            ${resetUrl}
          </div>
          
          <p>This link will expire in 1 hour for security reasons. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          
          <p>Regards,<br>The EcoSattva Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EcoSattva. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
}; 