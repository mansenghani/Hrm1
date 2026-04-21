const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createTeam,
  addMembers,
  getAllTeams,
  getMyTeam
} = require('../controllers/teamController');

router.use(protect);

router.get('/', authorize('hr', 'admin'), getAllTeams);
router.post('/create', authorize('hr', 'admin'), createTeam);
router.put('/add-members/:teamId', authorize('hr', 'admin'), addMembers);
router.get('/my', authorize('manager', 'employee', 'hr', 'admin'), getMyTeam);

module.exports = router;
