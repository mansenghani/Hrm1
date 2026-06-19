const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 🛰️ PERSONNEL REGISTRY ROUTES
 */

// 🛡️ Admin Only: Create Personnel Node
router.post('/create', protect, authorize('admin', 'hr'), userController.createUser);

module.exports = router;
