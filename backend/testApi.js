require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

const testApi = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
    await mongoose.connect(MONGO_URI);

    const user = await User.findOne({ role: 'employee' });
    if (!user) {
      console.log('No employee found');
      process.exit(1);
    }

    console.log('Testing for user:', user._id);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resCal = await axios.get(`http://127.0.0.1:5000/api/time/calendar/${user._id}?month=2026-07`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Calendar Data Status:', resCal.status);
    console.log('Calendar Data:', resCal.data);

    const resDaily = await axios.get(`http://127.0.0.1:5000/api/time/daily/${user._id}/2026-07-19`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Daily Data Status:', resDaily.status);
    console.log('Daily Data:', resDaily.data);

    process.exit(0);
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testApi();
