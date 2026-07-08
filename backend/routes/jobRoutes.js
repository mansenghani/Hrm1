const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob, duplicateJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all job endpoints
router.use(protect);

router.route('/')
  .get(getJobs)
  .post(authorize('admin', 'hr'), createJob);

router.route('/:id')
  .put(authorize('admin', 'hr'), updateJob)
  .delete(authorize('admin', 'hr'), deleteJob);

router.post('/:id/duplicate', authorize('admin', 'hr'), duplicateJob);

module.exports = router;
