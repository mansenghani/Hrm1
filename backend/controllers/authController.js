const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 🛡️ AUTH: Login Logic
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is initializing. Please try again in a few seconds.' });
    }

    const user = await User.findOne({ email });

    // Ensure status is active
    if (user && user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Role check if provided matching the url
    // Actually, maybe users only have one role anyway. We verify if user exists.
    if (user && (await user.comparePassword(password))) {
      // Just check if the role they are logging into matches their actual role or if they are admin
      if (role && user.role !== role && user.role !== 'admin') {
         return res.status(403).json({ message: `Access Denied: You are not authorized for role ${role}` });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('🔥 Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🛠️ ADMIN ONLY: Create New User (can be used for initial setup)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database offline' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'employee',
      status: status || 'active'
    });

    await newUser.save();
    
    res.status(201).json({
      message: `${role} created successfully`,
      user: { _id: newUser._id, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error('🔥 Create User Error:', error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 🔐 SECURE: Update User Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Verification failed: Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Security protocol updated successfully' });
  } catch (error) {
    res.status(500).json({ message: `System Error: ${error.message}` });
  }
};
