const mongoose = require("mongoose");

const carbonTrackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // Only require userId if userEmail is not provided
        return !this.userEmail;
      },
    },
    userEmail: {
      type: String,
      required: function () {
        // Only require userEmail if userId is not provided
        return !this.userId;
      },
    },
    deviceName: {
      type: String,
      required: true,
    },
    readingValue: {
      type: Number,
      required: true,
    },
    readingUnit: {
      type: String,
      required: true,
      default: "g/CO2",
    },
    readingDate: {
      type: Date,
      default: Date.now,
    },
    deviceLocation: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create an index for faster queries by userId
carbonTrackerSchema.index({ userId: 1, readingDate: -1 });
carbonTrackerSchema.index({ userEmail: 1, readingDate: -1 });

module.exports = mongoose.model("CarbonTrackerData", carbonTrackerSchema);
