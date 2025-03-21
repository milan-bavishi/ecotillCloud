const AwsCredentials = require("../models/AwsCredentials");
const AwsService = require("../services/awsService");

class AwsController {
  static async saveCredentials(req, res) {
    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = req.user.id; // Assuming user info is added by auth middleware

      const credentials = new AwsCredentials({
        userId,
        accessKeyId,
        secretAccessKey,
        region,
      });

      await credentials.save();
      res.status(201).json({ message: "AWS credentials saved successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getResourceUsage(req, res) {
    try {
      const userId = req.user.id; // Assuming user info is added by auth middleware
      const usageData = await AwsService.getInstanceUsage(userId);
      res.json(usageData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCredentials(req, res) {
    try {
      const userId = req.user.id; // Assuming user info is added by auth middleware
      const credentials = await AwsCredentials.findOne({ userId });
      if (!credentials) {
        return res.status(404).json({ error: "AWS credentials not found" });
      }
      res.json({
        region: credentials.region,
        lastUsed: credentials.lastUsed,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AwsController;
