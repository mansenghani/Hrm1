require('dotenv').config();
const mongoose = require('mongoose');
const TimeTrack = require('./models/TimeTrack');
const User = require('./models/User');

const test = async () => {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
  await mongoose.connect(MONGO_URI);
  
  const user = await User.findOne({});
  console.log('Testing for user:', user._id);
  
  const tracks = await TimeTrack.find({ employeeId: user._id });
  console.log('Tracks found:', tracks.map(t => t.date));
  
  process.exit(0);
};

test();
