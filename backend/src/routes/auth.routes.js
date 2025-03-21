const express = require('express');
const authController = require('../controllers/auth.controller');
const firebaseAuthController = require('../controllers/firebase-auth.controller');
const router = express.Router();

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/reset-password-request', authController.resetPasswordRequest);
router.post('/reset-password', authController.resetPassword);

// Firebase authentication - commented out until proper setup
// router.post('/firebase-auth', firebaseAuthController.firebaseAuth);

module.exports = router; 