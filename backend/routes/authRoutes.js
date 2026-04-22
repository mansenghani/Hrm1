const express = require('express');
const router = express.Router();
const { login, getMe, createUser, updatePassword, uploadProfileImage } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/login', login);
router.post('/create-user', protect, createUser);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
