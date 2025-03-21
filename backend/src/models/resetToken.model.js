const mongoose = require('mongoose');
const crypto = require('crypto');

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour (3600 seconds)
  },
});

// Static method to generate a reset token
resetTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = ResetToken; 