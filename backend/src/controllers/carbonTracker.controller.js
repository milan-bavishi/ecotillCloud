const CarbonTrackerData = require("../models/CarbonTrackerData");
const mongoose = require("mongoose");

// Add a new carbon tracker reading
exports.addReading = async (req, res) => {
  try {
    const { deviceName, readingValue, readingUnit, deviceLocation, notes } =
      req.body;

    // Create reading data object
    const readingData = {
      deviceName,
      readingValue,
      readingUnit: readingUnit || "g/CO2",
      deviceLocation,
      notes,
      userEmail: req.user.email,
    };

    // Only add userId if it's a valid MongoDB ObjectId
    if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      readingData.userId = req.user.id;
    }

    // Create new tracker data entry
    const newReading = new CarbonTrackerData(readingData);

    await newReading.save();

    return res.status(201).json({
      success: true,
      message: "Carbon tracker reading added successfully",
      data: newReading,
    });
  } catch (error) {
    console.error("Error adding carbon tracker reading:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add carbon tracker reading",
      error: error.message,
    });
  }
};

// Get all readings for logged in user
exports.getReadings = async (req, res) => {
  try {
    // Prepare query conditions
    const queryConditions = [];

    // Check for user in query params (from GET request)
    if (req.query && req.query.user) {
      queryConditions.push({ userEmail: req.query.user });
    }

    // Add userEmail condition from auth middleware
    if (req.user && req.user.email) {
      queryConditions.push({ userEmail: req.user.email });
    }

    // Only add userId condition if it's a valid ObjectId
    if (
      req.user &&
      req.user.id &&
      mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
      queryConditions.push({ userId: req.user.id });
    }

    console.log("Query conditions:", queryConditions); // Debugging

    // If no valid conditions, return empty results
    if (queryConditions.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Look up readings by userId or email for flexibility
    const readings = await CarbonTrackerData.find({
      $or: queryConditions,
    }).sort({ readingDate: -1 });

    console.log(`Found ${readings.length} readings`); // Debugging

    return res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error("Error fetching carbon tracker readings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carbon tracker readings",
      error: error.message,
    });
  }
};

// Get aggregated statistics for the logged in user
exports.getStats = async (req, res) => {
  try {
    console.log("getStats called with:", {
      query: req.query,
      user: req.user,
      authHeader: req.headers.authorization ? "present" : "not present",
    });

    // Prepare match conditions
    const queryConditions = [];

    // Check for user in query params (from GET request)
    if (req.query && req.query.user) {
      console.log("Adding query param user to conditions:", req.query.user);
      queryConditions.push({ userEmail: req.query.user });
    }

    // Add userEmail condition from auth middleware
    if (req.user && req.user.email) {
      console.log("Adding auth user email to conditions:", req.user.email);
      queryConditions.push({ userEmail: req.user.email });
    }

    // Only add userId condition if it's a valid ObjectId
    if (
      req.user &&
      req.user.id &&
      mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
      console.log("Adding auth user ID to conditions:", req.user.id);
      queryConditions.push({ userId: req.user.id });
    }

    // If no valid conditions, return empty results
    if (queryConditions.length === 0) {
      console.log("No valid query conditions, returning empty results");
      return res.status(200).json({
        success: true,
        data: {
          totalEmissions: 0,
          emissionsByDevice: [],
          recentTrend: [],
        },
      });
    }

    // Match condition for either userId or userEmail
    const matchCondition = {
      $or: queryConditions,
    };

    console.log("Stats match condition:", JSON.stringify(matchCondition));

    // Calculate total carbon emissions
    const totalEmissionsResult = await CarbonTrackerData.aggregate([
      { $match: matchCondition },
      { $group: { _id: null, total: { $sum: "$readingValue" } } },
    ]);

    console.log("Total emissions result:", totalEmissionsResult);

    const totalEmissions =
      totalEmissionsResult.length > 0 ? totalEmissionsResult[0].total : 0;

    // Get emissions by device
    const emissionsByDevice = await CarbonTrackerData.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$deviceName", total: { $sum: "$readingValue" } } },
      { $sort: { total: -1 } },
    ]);

    console.log("Emissions by device count:", emissionsByDevice.length);

    // Get recent trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTrend = await CarbonTrackerData.aggregate([
      {
        $match: {
          ...matchCondition,
          readingDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$readingDate" },
            month: { $month: "$readingDate" },
            day: { $dayOfMonth: "$readingDate" },
          },
          total: { $sum: "$readingValue" },
          date: { $first: "$readingDate" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    console.log("Recent trend count:", recentTrend.length);

    const response = {
      success: true,
      data: {
        totalEmissions,
        emissionsByDevice,
        recentTrend,
      },
    };

    console.log("Sending stats response with success:", response.success);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching carbon tracker statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carbon tracker statistics",
      error: error.message,
    });
  }
};

// Delete a reading by ID
exports.deleteReading = async (req, res) => {
  try {
    const reading = await CarbonTrackerData.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Carbon tracker reading not found",
      });
    }

    // Check if the reading belongs to the user by ID or email
    const hasValidId =
      req.user.id && mongoose.Types.ObjectId.isValid(req.user.id);

    if (
      (!hasValidId || reading.userId?.toString() !== req.user.id) &&
      reading.userEmail !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this reading",
      });
    }

    await CarbonTrackerData.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Carbon tracker reading deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting carbon tracker reading:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete carbon tracker reading",
      error: error.message,
    });
  }
};
