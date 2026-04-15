const User = require('../models/User');

exports.getManagers = async (req, res) => {
  try {
    // Only users with role 'manager'
    const managers = await User.find({ role: 'manager', status: 'active' }).select('-password');
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
