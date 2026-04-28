const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  updateActivity,
  getMyTime,
  getTeamTime,
  getHRTime,
  getAllTime,
  getSessionStatus,
  getTimeSummary,
  getLogs,
  getTimeByDate,
  getDashboardData
} = require('../controllers/timeTrackController');

// 🟢 Session Control
router.post('/start', protect, startTracking);
router.post('/pause', protect, pauseTracking);
router.post('/resume', protect, resumeTracking);
router.post('/stop', protect, stopTracking);

// 🔄 Monitoring
router.post('/activity', protect, updateActivity);
router.get('/status', protect, getSessionStatus);

// 📊 Analytics & History
router.get('/my', protect, getMyTime);
router.get('/summary', protect, getTimeSummary);
router.get('/logs', protect, getLogs);
router.get('/date/:date', protect, getTimeByDate);

// 🚀 UNIFIED DASHBOARD
router.get('/dashboard', protect, getDashboardData);

// 👨‍💼 Role-Based Views
router.get('/team', protect, authorize('manager', 'admin'), getTeamTime);
router.get('/hr', protect, authorize('hr', 'admin'), getHRTime);
router.get('/all', protect, authorize('admin'), getAllTime);

module.exports = router;
