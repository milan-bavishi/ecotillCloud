const WasteReport = require("../models/wasteReport.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/waste";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

class WasteController {
  static async reportWaste(req, res) {
    try {
      console.log("Reporting waste...");
      const userId = req.user.id;
      const { location, wasteType, amount, unit } = req.body;
      const imageUrl = req.file ? `/uploads/waste/${req.file.filename}` : null;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image is required" });
      }

      const wasteReport = new WasteReport({
        userId,
        location,
        wasteType,
        amount: parseFloat(amount),
        unit,
        imageUrl,
        status: "pending",
      });

      await wasteReport.save();
      console.log("Waste report saved successfully");
      res.status(201).json(wasteReport);
    } catch (error) {
      console.error("Error reporting waste:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getWasteReports(req, res) {
    try {
      console.log("Getting waste reports...");
      const userId = req.user.id;
      const reports = await WasteReport.find({ userId })
        .sort({ createdAt: -1 })
        .populate("verifiedBy", "fullName")
        .populate("collectedBy", "fullName");
      console.log(`Found ${reports.length} reports`);
      res.json(reports);
    } catch (error) {
      console.error("Error getting waste reports:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getCollectionTasks(req, res) {
    try {
      console.log("Getting collection tasks...");
      const tasks = await WasteReport.find({
        status: "verified",
        collectedBy: { $exists: false },
      })
        .populate("userId", "fullName")
        .sort({ createdAt: -1 });
      console.log(`Found ${tasks.length} collection tasks`);
      res.json(tasks);
    } catch (error) {
      console.error("Error getting collection tasks:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async acceptCollectionTask(req, res) {
    try {
      console.log("Accepting collection task...");
      const { reportId } = req.params;
      const collectorId = req.user.id;

      const report = await WasteReport.findById(reportId);
      if (!report) {
        return res.status(404).json({ error: "Waste report not found" });
      }

      if (report.status !== "verified") {
        return res.status(400).json({ error: "Report is not verified" });
      }

      report.collectedBy = collectorId;
      report.collectedAt = new Date();
      report.status = "collected";
      await report.save();

      // Calculate reward points based on waste type and amount
      const rewardPoints = calculateRewardPoints(
        report.wasteType,
        report.amount
      );
      report.rewardPoints = rewardPoints;
      await report.save();

      console.log("Collection task accepted successfully");
      res.json(report);
    } catch (error) {
      console.error("Error accepting collection task:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async verifyWasteReport(req, res) {
    try {
      console.log("Verifying waste report...");
      const { reportId } = req.params;
      const verifierId = req.user.id;

      const report = await WasteReport.findById(reportId);
      if (!report) {
        return res.status(404).json({ error: "Waste report not found" });
      }

      report.status = "verified";
      report.verifiedBy = verifierId;
      report.verifiedAt = new Date();
      await report.save();

      console.log("Waste report verified successfully");
      res.json(report);
    } catch (error) {
      console.error("Error verifying waste report:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getWasteStats(req, res) {
    try {
      console.log("Getting waste statistics...");
      const userId = req.user.id;

      const [totalReports, totalCollections, totalPoints] = await Promise.all([
        WasteReport.countDocuments({ userId }),
        WasteReport.countDocuments({ userId, status: "collected" }),
        WasteReport.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, total: { $sum: "$rewardPoints" } } },
        ]),
      ]);

      const stats = {
        totalReports,
        totalCollections,
        totalPoints: totalPoints[0]?.total || 0,
      };

      console.log("Waste statistics retrieved successfully");
      res.json(stats);
    } catch (error) {
      console.error("Error getting waste statistics:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

// Helper function to calculate reward points
function calculateRewardPoints(wasteType, amount) {
  const basePoints = {
    plastic: 10,
    "mixed waste": 5,
    "e-waste": 20,
    organic: 3,
    paper: 8,
    metal: 15,
    glass: 12,
  };

  const basePoint = basePoints[wasteType] || 5;
  return Math.round(basePoint * amount);
}

module.exports = WasteController;
