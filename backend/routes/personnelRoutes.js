const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/authMiddleware');

// 🛰️ DIAGNOSTIC: Public Personnel Node (Temporary Bypass)
router.get('/hrs', async (req, res) => {
  console.log(`[NETWORK TRACE] Personnel Hub Pinged | STATE: OPEN ACCESS`);
  try {
    const hrs = await User.find({ role: 'hr' }, 'name fullName email role');
    res.json(hrs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use(protect);

router.get('/managers', authorize('admin', 'hr'), async (req, res) => {
  const managers = await User.find({ role: 'manager' }, 'name fullName email role');
  res.json(managers);
});

router.get('/employees', authorize('admin', 'hr', 'manager'), async (req, res) => {
  const employees = await User.find({ role: 'employee' }, 'name email role');
  res.json(employees);
});

// 🔢 SEQUENTIAL IDENTITY ENGINE: Fetch Next ID for Role
router.get('/next-id/:role', authorize('admin'), async (req, res) => {
  try {
    const roleMatch = req.params.role.toLowerCase();
    const count = await User.countDocuments({ role: roleMatch });
    // Pattern: {role}-{number}.{role} (e.g., hr-004.hr)
    const nextId = `${roleMatch}-${String(count + 1).padStart(3, '0')}.${roleMatch}`;
    res.json({ nextId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🤝 COMMAND CHAIN: Fetch Direct Reports for Manager
router.get('/my-team', authorize('manager'), async (req, res) => {
  try {
    // In this architecture, we query the User collection for employees 
    // referencing this managerId (assuming assigned during creation)
    const team = await User.find({ 
        role: 'employee',
        reportingManager: req.user.id 
    }, 'name email employeeId status');
    
    res.json(team);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
