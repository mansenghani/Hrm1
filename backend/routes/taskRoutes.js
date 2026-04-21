const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getHRTasks,
  forwardToManager,
  getManagerTasks,
  assignEmployee,
  getMyTasks,
  updateTaskStatus,
  getAllTasksAdmin,
  deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin Routes
router.post('/create', authorize('admin'), createTask);
router.get('/admin-all', getAllTasksAdmin);
router.delete('/:taskId', authorize('admin'), deleteTask);

// HR Routes
router.get('/hr', authorize('hr'), getHRTasks);
router.put('/forward-to-manager/:taskId', authorize('hr'), forwardToManager);

// Manager Routes
router.get('/manager', authorize('manager'), getManagerTasks);
router.post('/manager-create', authorize('manager'), require('../controllers/taskController').createManagerTask);
router.get('/team', authorize('manager', 'employee', 'hr', 'admin'), require('../controllers/taskController').getTeamTasks);
router.put('/assign-employee/:taskId', authorize('manager'), assignEmployee);

// Employee Routes
router.get('/my', authorize('employee'), getMyTasks);
router.put('/update-status/:taskId', authorize('employee'), updateTaskStatus);

module.exports = router;
