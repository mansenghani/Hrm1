const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Clock In / Check In
// @route   POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existing = await Attendance.findOne({ user: req.user.id, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      date: today,
      checkInTime: new Date(),
      status: 'Present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clock Out / Check Out
// @route   POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user.id, date: today });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today.' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today.' });
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;

    // Calculate total hours
    const diffMs = checkOutTime - new Date(attendance.checkInTime);
    attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Attendance based on Role Hierarchy
// @route   GET /api/attendance
exports.getAttendance = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const userId = req.user.id;

    let query = {};

    if (role === 'admin') {
      // Admin sees everyone
      query = {};
    } else if (role === 'hr') {
      // HR sees everyone (or specific filtering if needed, but admin/hr usually identical here)
      query = {};
    } else if (role === 'manager') {
      // Manager sees themselves + direct reports
      const myTeam = await Employee.find({ managerId: userId }).select('userId');
      const teamUserIds = myTeam.map(emp => emp.userId).filter(id => id);
      teamUserIds.push(userId); // include manager themselves
      query = { user: { $in: teamUserIds } };
    } else {
      // Employee sees only themselves
      query = { user: userId };
    }

    const records = await Attendance.find(query)
      .populate('user', 'name role email')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
