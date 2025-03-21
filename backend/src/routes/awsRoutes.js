const express = require("express");
const router = express.Router();
const AwsController = require("../controllers/awsController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Save AWS credentials
router.post("/credentials", AwsController.saveCredentials);

// Get AWS credentials (without sensitive data)
router.get("/credentials", AwsController.getCredentials);

// Get AWS resource usage and CO2 emissions
router.get("/usage", AwsController.getResourceUsage);

module.exports = router;
