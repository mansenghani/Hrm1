const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  getEmployeeById,
  createEmployee,
  updateEmployee, 
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeesByManager
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const upload = require('../middleware/upload');

router.get('/', protect, getEmployees);
router.post('/', protect, authorize('admin', 'hr'), createEmployee);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, authorize('admin', 'hr'), updateEmployee);
router.post('/:id/profile-image', protect, authorize('admin', 'hr'), upload.single('image'), (req, res) => {
  const { updateEmployeeProfileImage } = require('../controllers/employeeController');
  updateEmployeeProfileImage(req, res);
});
router.delete('/:id', protect, authorize('admin'), deleteEmployee);
router.patch('/:id/status', protect, authorize('admin', 'hr'), updateEmployeeStatus);
router.get('/manager/:managerId', protect, authorize('admin', 'hr', 'manager'), getEmployeesByManager);

module.exports = router;
