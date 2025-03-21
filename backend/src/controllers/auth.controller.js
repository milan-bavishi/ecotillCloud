const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const ResetToken = require('../models/resetToken.model');
const emailService = require('../config/email');

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Helper function to create and send token response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, occupation, industry } = req.body;

    // Log request data (without password) for debugging
    console.log('Signup request received:', { 
      fullName, 
      email, 
      occupation, 
      industry 
    });

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, allow re-signup
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Create new user - mark as unverified initially
    const user = await User.create({
      fullName,
      email,
      password,
      occupation: occupation || '',
      industry: industry || '',
      isVerified: false
    });

    // Generate OTP
    const otp = emailService.generateOTP();

    // Save OTP to database
    await OTP.create({
      email: user.email,
      otp
    });

    // Send OTP to user's email
    await emailService.sendOTPEmail(email, fullName, otp);

    // Generate token and send response
    // For security, send limited user data until verified
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      }
    });
  } catch (error) {
    console.error('Signup error details:', error);
    
    // Send a properly structured error response
    return res.status(500).json({
      success: false,
      message: 'An error occurred during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for verification
      const otp = emailService.generateOTP();

      // Save OTP to database (overwrite existing)
      await OTP.findOneAndDelete({ email: user.email }); // Remove any existing OTP
      await OTP.create({
        email: user.email,
        otp
      });

      // Send OTP to user's email
      await emailService.sendOTPEmail(email, user.fullName, otp);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. A new verification OTP has been sent to your email.',
        needsVerification: true,
        userId: user._id
      });
    }

    // Generate token and send response
    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate OTP input
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please enter a 6-digit code.'
      });
    }

    // Find the stored OTP for this email
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new verification code.'
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Find user and mark as verified
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user to verified status
    user.isVerified = true;
    await user.save();

    // Delete the used OTP
    await OTP.findOneAndDelete({ email });

    // Generate token and send response
    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during OTP verification'
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Delete any existing OTPs for this email
    await OTP.findOneAndDelete({ email });

    // Generate new OTP
    const otp = emailService.generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp
    });

    // Send OTP to user's email
    await emailService.sendOTPEmail(email, user.fullName, otp);

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code'
    });
  }
};

/**
 * @desc    Reset password request
 * @route   POST /api/auth/reset-password-request
 * @access  Public
 */
exports.resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Delete any existing reset tokens for this email
    await ResetToken.findOneAndDelete({ email });

    // Generate new reset token
    const resetToken = ResetToken.generateToken();

    // Save reset token to database
    await ResetToken.create({
      email,
      token: resetToken
    });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&email=${email}`;
    
    // For development environment, use the frontend URL
    // Make sure this port matches your Vite frontend port
    const frontendResetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      email, 
      user.fullName, 
      resetToken, 
      process.env.NODE_ENV === 'development' ? frontendResetUrl : resetUrl
    );

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during password reset request'
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public (with token)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Verify token
    const resetTokenRecord = await ResetToken.findOne({ email });
    
    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired. Please request a new password reset.'
      });
    }

    // Check if token matches
    if (resetTokenRecord.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset token. Please request a new password reset.'
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Delete the used token
    await ResetToken.findOneAndDelete({ email });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during password reset'
    });
  }
}; 