const express = require("express");
const router = express.Router();
const AwsController = require("../controllers/awsController");
const { protect } = require("../middleware/auth");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AWS service is running" });
});

// All routes below require authentication
router.use(protect);

// Save AWS credentials
router.post("/credentials", AwsController.saveCredentials);

// Get AWS credentials (without sensitive data)
router.get("/credentials", AwsController.getCredentials);

// Get AWS resource usage and CO2 emissions
router.get("/usage", AwsController.getResourceUsage);

// Get AWS network usage and CO2 emissions
router.get("/network-usage", AwsController.getNetworkUsage);

// Get AWS S3 usage and CO2 emissions
router.get("/s3-usage", AwsController.getS3Usage);

module.exports = router;
