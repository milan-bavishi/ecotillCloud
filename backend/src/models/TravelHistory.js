const mongoose = require('mongoose');

const travelHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  sourceCoords: {
    type: [Number],
    required: true
  },
  destinationCoords: {
    type: [Number],
    required: true
  },
  transportMode: {
    type: String,
    required: true,
    enum: ['car', 'carpool', 'bus', 'train', 'bicycle', 'walking']
  },
  distance: {
    type: Number,
    required: true
  },
  co2Emissions: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const TravelHistory = mongoose.model('TravelHistory', travelHistorySchema);

module.exports = TravelHistory; 