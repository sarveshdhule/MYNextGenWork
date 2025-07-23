const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['job', 'contest', 'webinar'],
    default: 'job',
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time'],
    required: function() { return this.type === 'job'; }
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  date: { type: Date, required: true },
  externalLink: { type: String, trim: true },
  salary: { type: String },
  companyName: { type: String, trim: true },
  companyAddress: { type: String },
  contactInfo: { type: String },
  logo: { type: String }, // Only the filename, not the full path
  pic: { type: String },
  organizer: { type: String },
  prize: { type: String },
  contestDateTime: { type: String }, // or Date if you want to store as Date
  webinarDateTime: { type: String }, // or Date if you want
  speaker: { type: String },
  platform: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationFee: { type: Number, default: 0 },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    college: String,
    email: String,
    mobile: String,
    paymentId: String,
    paid: Boolean
  }],
  applicationDeadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);