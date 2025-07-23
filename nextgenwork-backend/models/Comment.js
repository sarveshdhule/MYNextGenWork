const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
}, { timestamps: true });

// Virtual for replies (not stored in DB, for population)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

module.exports = mongoose.model('Comment', commentSchema);