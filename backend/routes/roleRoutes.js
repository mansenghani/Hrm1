const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole, duplicateRole } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRoles)
  .post(authorize('admin'), createRole);

router.route('/:id')
  .put(authorize('admin'), updateRole)
  .delete(authorize('admin'), deleteRole);

router.post('/:id/duplicate', authorize('admin'), duplicateRole);

module.exports = router;
