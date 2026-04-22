const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getManagerTasks,
  assignEmployee,
  approveTask,
  rejectTask,
  getMyTasks,
  updateProgress,
  submitTask,
  uploadProof,
  addComment,
  getAllTasks,
  deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect);

// --- HR / ADMIN ---
router.post('/create', authorize('hr', 'admin'), upload.single('file'), createTask);
router.get('/all', authorize('hr', 'admin'), getAllTasks);
router.delete('/:taskId', authorize('admin'), deleteTask);

// --- MANAGER / HR LEAD ---
router.get('/manager', authorize('manager', 'hr'), getManagerTasks);
router.put('/assign/:taskId', authorize('manager', 'hr'), assignEmployee);
router.put('/approve/:taskId', authorize('manager', 'hr'), approveTask);
router.put('/reject/:taskId', authorize('manager', 'hr'), rejectTask);

// --- EMPLOYEE ---
router.get('/my', authorize('employee'), getMyTasks);
router.put('/progress/:taskId', authorize('employee'), updateProgress);
router.put('/submit/:taskId', authorize('employee'), submitTask);
router.post('/upload-proof/:taskId', authorize('employee', 'manager', 'hr'), upload.single('file'), uploadProof);

// --- COMMON ---
router.post('/comment/:taskId', authorize('manager', 'employee', 'hr', 'admin'), addComment);

module.exports = router;
