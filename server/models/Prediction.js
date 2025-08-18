const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  matchId: {
    type: Number,
    required: true
  },
  homeScore: {
    type: Number,
    required: true,
    min: 0
  },
  awayScore: {
    type: Number,
    required: true,
    min: 0
  },
  matchInfo: {
    homeTeam: String,
    awayTeam: String,
    competition: String,
    matchDate: Date
  },
  // Scoring fields
  points: {
    type: Number,
    default: 0
  },
  isExactScore: {
    type: Boolean,
    default: false
  },
  isCorrectResult: {
    type: Boolean,
    default: false
  },
  actualHomeScore: {
    type: Number,
    default: null
  },
  actualAwayScore: {
    type: Number,
    default: null
  },
  isScored: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate predictions from same user for same match
predictionSchema.index({ user: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
