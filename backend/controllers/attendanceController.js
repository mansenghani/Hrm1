const Attendance = require('../models/Attendance');

// @desc    Clock In
// @route   POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  try {
    const { date, time, location } = req.body;

    // Check if already clocked in today
    const existing = await Attendance.findOne({ user: req.user.id, date });
    if (existing) {
      return res.status(400).json({ message: 'Already clocked in for today' });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      date,
      clockIn: time,
      location,
      status: 'Present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clock Out
// @route   PUT /api/attendance/clock-out
exports.clockOut = async (req, res) => {
  try {
    const { date, time } = req.body;
    const attendance = await Attendance.findOne({ user: req.user.id, date });

    if (!attendance) {
      return res.status(404).json({ message: 'No clock-in record found for today' });
    }

    attendance.clockOut = time;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Attendance
// @route   GET /api/attendance/me
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Attendance (Admin/HR)
// @route   GET /api/attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'name role email').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
