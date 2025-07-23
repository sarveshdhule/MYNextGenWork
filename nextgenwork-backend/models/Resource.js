const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  domain: { type: String, required: true },
  resourceLinks: [
    {
      type: { type: String, required: true },
      link: { type: String, required: true }
    }
  ],
  tags: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, min: 1, max: 5, required: true }
    }
  ],
  views: { type: Number, default: 0 }
});

// Virtual for average rating
ResourceSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / this.ratings.length;
});

module.exports = mongoose.model('Resource', ResourceSchema);
