const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  recordUsage,
  getUsageHistory,
  getRecommendations
} = require('../controllers/cloudUsage.controller');

// Protect all routes
router.use(protect);

// Record new cloud usage data
router.post('/', recordUsage);

// Get usage history with filters
router.get('/history', getUsageHistory);

// Get recommendations
router.get('/recommendations', getRecommendations);

module.exports = router; 