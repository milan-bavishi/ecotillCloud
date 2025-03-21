const mongoose = require('mongoose');

const llmUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
  },
  tokens: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number, // in milliseconds
    required: true,
    min: 0,
  },
  batchSize: {
    type: Number,
    required: true,
    min: 1,
  },
  carbonEmission: {
    type: Number, // in grams of CO2e
    required: true,
    min: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add an index for efficient queries
llmUsageSchema.index({ userId: 1, timestamp: -1 });

const LLMUsage = mongoose.model('LLMUsage', llmUsageSchema);

module.exports = LLMUsage; 