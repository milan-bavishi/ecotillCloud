const LLMUsage = require("../models/llmUsage.model");
const mongoose = require("mongoose");

/**
 * Record new LLM usage
 */
exports.recordUsage = async (req, res) => {
  try {
    const { modelName, tokens, duration, batchSize, carbonEmission } = req.body;

    // Create new usage record
    const usage = await LLMUsage.create({
      userId: req.user._id,
      modelName,
      tokens,
      duration,
      batchSize,
      carbonEmission,
    });

    res.status(201).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error("Error recording LLM usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record LLM usage",
    });
  }
};

/**
 * Record new LLM usage without authentication
 */
exports.recordUsageNoAuth = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const {
      modelName,
      tokens,
      duration,
      batchSize,
      carbonEmission,
      userId,
      email,
    } = req.body;

    // Log all received values
    console.log("Parsed values:", {
      modelName,
      tokens,
      duration,
      batchSize,
      carbonEmission,
      userId,
      email,
    });

    // If userId is not provided, check for email
    let userIdToUse = userId;

    if (!userIdToUse && !email) {
      console.log("Missing userId and email in request");
      return res.status(400).json({
        success: false,
        message: "Either User ID or email is required",
      });
    }

    // If we have an email but no userId, try to find the user by email
    if (!userIdToUse && email) {
      // Import User model if not already imported at the top
      const User = require("../models/user.model");

      try {
        const user = await User.findOne({ email: email });
        if (user) {
          userIdToUse = user._id;
          console.log(`Found user with ID ${userIdToUse} for email ${email}`);
        } else {
          // If user not found, we could create a temporary user here or use a generic ID
          console.log(`No user found with email ${email}`);
          return res.status(404).json({
            success: false,
            message: "User with provided email not found",
          });
        }
      } catch (error) {
        console.error("Error finding user by email:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing user email",
        });
      }
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userIdToUse)) {
      console.log("Invalid userId format:", userIdToUse);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate other required fields
    if (!modelName || !tokens || !duration || !batchSize || !carbonEmission) {
      console.log("Missing required fields:", {
        modelName: !modelName,
        tokens: !tokens,
        duration: !duration,
        batchSize: !batchSize,
        carbonEmission: !carbonEmission,
      });
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: modelName, tokens, duration, batchSize, carbonEmission",
      });
    }

    // Validate numeric fields
    if (
      isNaN(tokens) ||
      isNaN(duration) ||
      isNaN(batchSize) ||
      isNaN(carbonEmission)
    ) {
      console.log("Invalid numeric values:", {
        tokens: isNaN(tokens),
        duration: isNaN(duration),
        batchSize: isNaN(batchSize),
        carbonEmission: isNaN(carbonEmission),
      });
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values provided",
      });
    }

    console.log("Creating new usage record with data:", {
      userId: userIdToUse,
      modelName,
      tokens,
      duration,
      batchSize,
      carbonEmission,
    });

    // Create new usage record
    const usage = await LLMUsage.create({
      userId: userIdToUse,
      modelName,
      tokens,
      duration,
      batchSize,
      carbonEmission,
    });

    console.log("Successfully created usage record:", usage);

    res.status(201).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error("Error recording LLM usage without auth:", error);
    // Log more details about the error
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to record LLM usage",
      error: error.message,
    });
  }
};

/**
 * Get user's LLM usage history
 */
exports.getUserUsage = async (req, res) => {
  try {
    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const modelName = req.query.modelName || null;

    // Build filter object
    const filter = { userId: req.user._id };

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.timestamp = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.timestamp = { $gte: startDate };
    } else if (endDate) {
      filter.timestamp = { $lte: endDate };
    }

    // Add model name filter if provided
    if (modelName) {
      filter.modelName = modelName;
    }

    // Query with pagination
    const usages = await LLMUsage.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const total = await LLMUsage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: usages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching LLM usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch LLM usage history",
    });
  }
};

/**
 * Get aggregated stats for visualization
 */
exports.getAggregatedStats = async (req, res) => {
  try {
    // Convert user ID to ObjectId for aggregation
    const userId = mongoose.Types.ObjectId.isValid(req.user._id)
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;

    // Get time range filter
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    // Stats by model
    const statsByModel = await LLMUsage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$modelName",
          totalTokens: { $sum: "$tokens" },
          totalDuration: { $sum: "$duration" },
          averageBatchSize: { $avg: "$batchSize" },
          totalEmissions: { $sum: "$carbonEmission" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalEmissions: -1 } },
    ]);

    // Daily emissions over time
    const dailyEmissions = await LLMUsage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalEmissions: { $sum: "$carbonEmission" },
          totalTokens: { $sum: "$tokens" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          totalEmissions: 1,
          totalTokens: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Overall totals
    const totals = await LLMUsage.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: "$carbonEmission" },
          totalTokens: { $sum: "$tokens" },
          totalDuration: { $sum: "$duration" },
          averageBatchSize: { $avg: "$batchSize" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byModel: statsByModel,
        dailyEmissions: dailyEmissions,
        totals:
          totals.length > 0
            ? totals[0]
            : {
                totalEmissions: 0,
                totalTokens: 0,
                totalDuration: 0,
                averageBatchSize: 0,
                count: 0,
              },
      },
    });
  } catch (error) {
    console.error("Error fetching LLM usage stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch LLM usage statistics",
    });
  }
};

/**
 * Get aggregated stats without authentication
 */
exports.getAggregatedStatsNoAuth = async (req, res) => {
  try {
    // Get user ID or email from query params
    const {
      userId,
      email,
      startDate: startDateStr,
      endDate: endDateStr,
    } = req.query;

    let userObjectId;

    // If userId is not provided, try to find user by email
    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: "Either User ID or email is required",
      });
    }

    if (userId) {
      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }

      // Convert user ID to ObjectId
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else if (email) {
      // Look up user by email
      const User = require("../models/user.model");

      try {
        const user = await User.findOne({ email: email });
        if (user) {
          userObjectId = user._id;
          console.log(`Found user with ID ${userObjectId} for email ${email}`);
        } else {
          console.log(`No user found with email ${email}`);
          return res.status(404).json({
            success: false,
            message: "User with provided email not found",
          });
        }
      } catch (error) {
        console.error("Error finding user by email:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing user email",
        });
      }
    }

    // Parse date parameters
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    // Stats by model
    const statsByModel = await LLMUsage.aggregate([
      {
        $match: {
          userId: userObjectId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$modelName",
          totalTokens: { $sum: "$tokens" },
          totalDuration: { $sum: "$duration" },
          averageBatchSize: { $avg: "$batchSize" },
          totalEmissions: { $sum: "$carbonEmission" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalEmissions: -1 } },
    ]);

    // Daily emissions over time
    const dailyEmissions = await LLMUsage.aggregate([
      {
        $match: {
          userId: userObjectId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalEmissions: { $sum: "$carbonEmission" },
          totalTokens: { $sum: "$tokens" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          totalEmissions: 1,
          totalTokens: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Overall totals
    const totals = await LLMUsage.aggregate([
      {
        $match: {
          userId: userObjectId,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: "$carbonEmission" },
          totalTokens: { $sum: "$tokens" },
          totalDuration: { $sum: "$duration" },
          averageBatchSize: { $avg: "$batchSize" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byModel: statsByModel,
        dailyEmissions: dailyEmissions,
        totals:
          totals.length > 0
            ? totals[0]
            : {
                totalEmissions: 0,
                totalTokens: 0,
                totalDuration: 0,
                averageBatchSize: 0,
                count: 0,
              },
      },
    });
  } catch (error) {
    console.error("Error fetching LLM usage stats without auth:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch LLM usage statistics",
    });
  }
};
