const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAvailableUsers, getChats, getMessages, getGroupMessages,
  sendMessage, markAsSeen, createGroup, deleteMessage,
  toggleReaction, togglePin, toggleStar, forwardMessage
} = require('../controllers/chatController');
const upload = require('../middleware/upload');

router.get('/users', protect, getAvailableUsers);
router.post('/group', protect, createGroup);
router.get('/list', protect, getChats);
router.get('/messages/:userId', protect, getMessages);
router.get('/group-messages/:chatId', protect, getGroupMessages);
router.post('/send', protect, upload.array('files', 10), sendMessage);
router.put('/seen', protect, markAsSeen);
router.delete('/message/:messageId', protect, deleteMessage);
router.post('/message/:messageId/react', protect, toggleReaction);
router.post('/message/:messageId/pin', protect, togglePin);
router.post('/message/:messageId/star', protect, toggleStar);
router.post('/message/forward', protect, forwardMessage);

module.exports = router;
