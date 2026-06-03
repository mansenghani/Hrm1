const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllRead,
  createNotification,
  updateNotification,
  deleteNotification
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllRead);
router.put('/:id', protect, updateNotification);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
