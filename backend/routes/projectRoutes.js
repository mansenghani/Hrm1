const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProject,
  getHRProjects,
  getManagerProjects,
  assignEmployees,
  getEmployeeProjects
} = require('../controllers/projectController');

router.post('/create', protect, authorize('hr', 'admin'), createProject);
router.get('/hr', protect, authorize('hr', 'admin'), getHRProjects);
router.get('/manager', protect, authorize('manager'), getManagerProjects);
router.put('/assign-employees/:projectId', protect, authorize('manager'), assignEmployees);
router.get('/my', protect, authorize('employee'), getEmployeeProjects);

module.exports = router;
