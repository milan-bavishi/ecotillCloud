const express = require('express');
const { 
  saveTravel, 
  getUserTravelHistory, 
  getUserTravelStats,
  deleteTravel 
} = require('../controllers/travelController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Travel history routes
router.post('/', saveTravel);
router.get('/', getUserTravelHistory);
router.get('/stats', getUserTravelStats);
router.delete('/:id', deleteTravel);

module.exports = router; 
