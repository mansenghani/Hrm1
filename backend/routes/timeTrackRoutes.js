const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  startTracking,
  stopTracking,
  updateActivity,
  getMyTime,
  getTeamTime,
  getHRTime,
  getAllTime,
  getSessionStatus
} = require('../controllers/timeTrackController');

// 🟢 Employee actions (all roles can track their own time)
router.post('/start', protect, startTracking);
router.post('/stop', protect, stopTracking);
router.post('/activity', protect, updateActivity);
router.get('/status', protect, getSessionStatus);
router.get('/my', protect, getMyTime);

// 👨‍💼 Manager: view team
router.get('/team', protect, authorize('manager', 'admin'), getTeamTime);

// 🧑‍💼 HR: view employees + managers
router.get('/hr', protect, authorize('hr', 'admin'), getHRTime);

// 👑 Admin: full access
router.get('/all', protect, authorize('admin'), getAllTime);

module.exports = router;
