const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// Check-in and Check-out are protected, any logged-in user can perform them
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);

// Get attendance fetches data based on the hierarchy defined in controller
router.get('/', protect, getAttendance);

module.exports = router;
