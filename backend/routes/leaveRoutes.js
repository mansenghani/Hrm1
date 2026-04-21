const express = require('express');
const router = express.Router();
const { 
  applyLeave, 
  getManagerLeaves, 
  managerApprove, 
  getHRLeaves, 
  hrApprove, 
  rejectLeave, 
  cancelLeave,
  getMyLeaves, 
  getAllLeaves 
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 👤 Employee Routes
router.post('/apply', protect, authorize('employee', 'manager', 'hr', 'admin'), applyLeave);
router.get('/my', protect, getMyLeaves);
router.put('/cancel/:id', protect, cancelLeave);

// 👨‍💼 Manager Routes
router.get('/manager', protect, authorize('manager', 'admin'), getManagerLeaves);
router.put('/manager-approve/:id', protect, authorize('manager', 'admin'), managerApprove);

// 🧑‍💼 HR Routes
router.get('/hr', protect, authorize('hr', 'admin'), getHRLeaves);
router.put('/hr-approve/:id', protect, authorize('hr', 'admin'), hrApprove);

// ❌ Unified Reject Route
router.put('/reject/:id', protect, authorize('manager', 'hr', 'admin'), rejectLeave);

// 👑 Admin Route
router.get('/', protect, authorize('admin', 'hr'), getAllLeaves);

module.exports = router;
