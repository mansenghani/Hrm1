const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
  getMyLeaves
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin', 'hr'), getAllLeaves);
router.post('/', protect, authorize('employee'), applyLeave);
router.get('/my', protect, authorize('employee'), getMyLeaves);
router.put('/:id', protect, authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
