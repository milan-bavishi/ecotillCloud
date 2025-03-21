const AwsCredentials = require("../models/AwsCredentials");
const AwsService = require("../services/awsService");

class AwsController {
  static async saveCredentials(req, res) {
    try {
      console.log("Saving AWS credentials...");
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = req.user.id;

      console.log("User ID:", userId);
      console.log("Region:", region);

      // Check if credentials already exist
      const existingCredentials = await AwsCredentials.findOne({ userId });
      if (existingCredentials) {
        console.log("Updating existing credentials");
        existingCredentials.accessKeyId = accessKeyId;
        existingCredentials.secretAccessKey = secretAccessKey;
        existingCredentials.region = region;
        existingCredentials.lastUsed = new Date();
        await existingCredentials.save();
      } else {
        console.log("Creating new credentials");
        const credentials = new AwsCredentials({
          userId,
          accessKeyId,
          secretAccessKey,
          region,
        });
        await credentials.save();
      }

      console.log("AWS credentials saved successfully");
      res.status(201).json({ message: "AWS credentials saved successfully" });
    } catch (error) {
      console.error("Error saving AWS credentials:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getCredentials(req, res) {
    try {
      console.log("Getting AWS credentials...");
      const userId = req.user.id;
      console.log("User ID:", userId);

      const credentials = await AwsCredentials.findOne({ userId });
      if (!credentials) {
        console.log("No credentials found for user");
        return res.status(404).json({ error: "AWS credentials not found" });
      }

      console.log("Credentials found for user");
      res.json({
        region: credentials.region,
        lastUsed: credentials.lastUsed,
      });
    } catch (error) {
      console.error("Error getting AWS credentials:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getResourceUsage(req, res) {
    try {
      console.log("Getting AWS resource usage...");
      const userId = req.user.id;
      console.log("User ID:", userId);

      const usageData = await AwsService.getInstanceUsage(userId);
      console.log(`Found ${usageData.length} EC2 instances`);
      res.json(usageData);
    } catch (error) {
      console.error("Error getting AWS resource usage:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getNetworkUsage(req, res) {
    try {
      console.log("Getting AWS network usage...");
      const userId = req.user.id;
      console.log("User ID:", userId);

      const networkUsage = await AwsService.getNetworkUsage(userId);
      console.log(`Found ${networkUsage.length} network usage records`);
      res.json(networkUsage);
    } catch (error) {
      console.error("Error getting AWS network usage:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getS3Usage(req, res) {
    try {
      console.log("Getting AWS S3 usage...");
      const userId = req.user.id;
      console.log("User ID:", userId);

      const s3Usage = await AwsService.getS3Usage(userId);
      console.log(`Found ${s3Usage.length} S3 buckets`);
      res.json(s3Usage);
    } catch (error) {
      console.error("Error getting AWS S3 usage:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AwsController;
