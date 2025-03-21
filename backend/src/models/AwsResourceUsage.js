const mongoose = require("mongoose");

const awsResourceUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  instanceId: {
    type: String,
    required: true,
  },
  instanceType: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  runningHours: {
    type: Number,
    required: true,
  },
  cpuUtilization: {
    type: Number,
    required: true,
  },
  memoryUtilization: {
    type: Number,
    required: true,
  },
  storageUsed: {
    type: Number,
    required: true,
  },
  co2Emissions: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AwsResourceUsage", awsResourceUsageSchema);
