const mongoose = require("mongoose");

const wasteReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      required: true,
      enum: [
        "plastic",
        "mixed waste",
        "e-waste",
        "organic",
        "paper",
        "metal",
        "glass",
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "liters", "pieces"],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "collected", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    collectedAt: Date,
    rewardPoints: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WasteReport", wasteReportSchema);
