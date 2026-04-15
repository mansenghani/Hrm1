const express = require('express');
const router = express.Router();
const { getManagers } = require('../controllers/managerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getManagers);

module.exports = router;
