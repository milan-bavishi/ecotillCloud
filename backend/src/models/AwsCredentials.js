const mongoose = require("mongoose");

const awsCredentialsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accessKeyId: {
    type: String,
    required: true,
    encrypted: true,
  },
  secretAccessKey: {
    type: String,
    required: true,
    encrypted: true,
  },
  region: {
    type: String,
    required: true,
    default: "us-east-1",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AwsCredentials", awsCredentialsSchema);
