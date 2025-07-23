const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nextgenwork';

async function clearOldWebinars() {
  await mongoose.connect(MONGO_URI);
  const result = await Opportunity.deleteMany({ type: 'webinar' });
  console.log(`Deleted ${result.deletedCount} webinars.`);
  await mongoose.disconnect();
}

clearOldWebinars(); 