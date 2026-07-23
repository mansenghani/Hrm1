require('dotenv').config();
const mongoose = require('mongoose');
const TimeTrack = require('./models/TimeTrack');
const User = require('./models/User');

const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    if (!users || users.length === 0) {
      console.log('No users found.');
      process.exit(1);
    }

    const today = new Date();

    // Yesterday
    const d1 = new Date(today);
    d1.setDate(d1.getDate() - 1);
    const date1 = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;

    // Day before yesterday
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 2);
    const date2 = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;

    const dummyTracks = [];

    for (const user of users) {
      dummyTracks.push({
        employeeId: user._id,
        employeeRole: user.role || 'employee',
        date: date1,
        startTime: new Date(d1.setHours(9, Math.floor(Math.random() * 30), 0, 0)),
        endTime: new Date(d1.setHours(17, 30 + Math.floor(Math.random() * 30), 0, 0)),
        activeTime: 28800 + Math.floor(Math.random() * 1000), // ~8 hours + random
        idleTime: 1800 + Math.floor(Math.random() * 500),
        totalTime: 30600 + Math.floor(Math.random() * 1500),
        totalActiveTime: 28800 + Math.floor(Math.random() * 1000),
        status: 'completed',
        isRunning: false
      });

      dummyTracks.push({
        employeeId: user._id,
        employeeRole: user.role || 'employee',
        date: date2,
        startTime: new Date(d2.setHours(9, Math.floor(Math.random() * 30), 0, 0)),
        endTime: new Date(d2.setHours(18, Math.floor(Math.random() * 30), 0, 0)),
        activeTime: 29700 + Math.floor(Math.random() * 1000), // ~8 hours 15 mins + random
        idleTime: 1800 + Math.floor(Math.random() * 500),
        totalTime: 31500 + Math.floor(Math.random() * 1500),
        totalActiveTime: 29700 + Math.floor(Math.random() * 1000),
        status: 'completed',
        isRunning: false
      });
    }

    // Remove existing for those dates
    const userIds = users.map(u => u._id);
    await TimeTrack.deleteMany({ employeeId: { $in: userIds }, date: { $in: [date1, date2] } });

    await TimeTrack.insertMany(dummyTracks);
    console.log(`Successfully inserted dummy data for ${users.length} employees on ${date1} and ${date2}.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
