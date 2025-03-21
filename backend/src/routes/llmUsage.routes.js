const express = require('express');
const llmUsageController = require('../controllers/llmUsage.controller');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Non-authenticated routes
router.post('/no-auth', llmUsageController.recordUsageNoAuth);
router.get('/stats/no-auth', llmUsageController.getAggregatedStatsNoAuth);

// Routes that require authentication
router.use(protect);

// Record new LLM usage
router.post('/', llmUsageController.recordUsage);

// Get user's LLM usage history
router.get('/', llmUsageController.getUserUsage);

// Get aggregated stats for visualization
router.get('/stats', llmUsageController.getAggregatedStats);

module.exports = router; 