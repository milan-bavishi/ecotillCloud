const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Routes accessible without authentication
router.post('/complete-profile', userController.completeProfile);

// Protect all routes after this middleware
router.use(protect);

// User routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router; 