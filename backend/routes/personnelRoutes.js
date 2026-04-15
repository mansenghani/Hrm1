const express = require('express');
const router = express.Router();
const HR = require('../models/HR');
const Manager = require('../models/Manager');
const EmployeeUser = require('../models/EmployeeUser');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/hrs', authorize('admin'), async (req, res) => {
  const hrs = await HR.find({}, 'profile email');
  res.json(hrs);
});

router.get('/managers', authorize('admin', 'hr'), async (req, res) => {
  const managers = await Manager.find({}, 'profile email');
  res.json(managers);
});

router.get('/employees', authorize('admin', 'hr', 'manager'), async (req, res) => {
  const employees = await EmployeeUser.find({}, 'profile email');
  res.json(employees);
});

router.get('/my-team', authorize('manager'), async (req, res) => {
  const team = await EmployeeUser.find({ managerId: req.user.id }, 'profile email');
  res.json(team);
});

module.exports = router;
