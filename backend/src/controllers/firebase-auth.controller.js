const admin = require('firebase-admin');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK
try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    // Use environment variables instead of service account file
    admin.initializeApp({
      // Option 1: Use environment variables (recommended for production)
      // credential: admin.credential.cert({
      //   projectId: process.env.FIREBASE_PROJECT_ID,
      //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      //   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      // })
      
      // Option 2: Use a temporary dummy configuration for development
      projectId: "ecosattva-b2d24",
      databaseURL: "https://ecosattva-b2d24.firebaseio.com"
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error);
}

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
 * @desc    Verify Firebase ID token and sign in or register user
 * @route   POST /api/auth/firebase-auth
 * @access  Public
 */
exports.firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase token'
      });
    }

    // Extract user information from decoded token
    const { uid, email, name, email_verified, picture } = decodedToken;
    
    // Check if user exists in our database
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update their profile with latest information
      user.firebaseUid = uid;
      user.isVerified = email_verified;
      
      // Only update these fields if they exist in the token
      if (name && !user.fullName) user.fullName = name;
      
      await user.save();
    } else {
      // Create new user based on Firebase profile
      user = await User.create({
        email,
        fullName: name || email.split('@')[0], // Use name or extract from email
        firebaseUid: uid,
        password: Math.random().toString(36).slice(-12), // Random password for non-password accounts
        isVerified: email_verified,
        occupation: '',
        industry: '',
        profileImageUrl: picture || ''
      });
    }

    // Generate token and send response
    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error('Firebase authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate with Firebase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 