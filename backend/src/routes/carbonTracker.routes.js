const express = require("express");
const router = express.Router();
const carbonTrackerController = require("../controllers/carbonTracker.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Route to add a new carbon tracker reading
router.post("/", carbonTrackerController.addReading);

// Route to get all readings for the logged in user
router.get("/", carbonTrackerController.getReadings);
// Also allow POST for getting readings when we need to pass user data
router.post("/", (req, res, next) => {
  if (req.body && req.body._action === "getReadings") {
    carbonTrackerController.getReadings(req, res, next);
  } else {
    next(); // Continue to the next handler if not specifically requesting getReadings
  }
});

// Route to get statistics for the logged in user
router.get("/stats", carbonTrackerController.getStats);
// Also allow POST for stats
router.post("/stats", carbonTrackerController.getStats);

// Route to delete a reading
router.delete("/:id", carbonTrackerController.deleteReading);

module.exports = router;
