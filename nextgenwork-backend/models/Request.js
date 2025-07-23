const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  resumePath: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);