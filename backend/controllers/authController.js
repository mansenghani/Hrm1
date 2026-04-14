const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Manager = require('../models/Manager');
const EmployeeUser = require('../models/EmployeeUser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const getModelByRole = (role) => {
  // Convert to lowercase to be safe
  const r = role ? role.toLowerCase() : '';
  switch (r) {
    case 'admin': return Admin;
    case 'hr': return HR;
    case 'manager': return Manager;
    case 'employee': return EmployeeUser;
    default: return null;
  }
};

// 🛡️ AUTH: Login Logic
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is initializing. Please try again in a few seconds.' });
    }

    const Model = getModelByRole(role);
    if (!Model) {
      console.error(`❌ Invalid login role attempt: ${role}`);
      return res.status(400).json({ message: `Access Denied: Invalid role (${role})` });
    }

    const user = await Model.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
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

// 🛠️ ADMIN ONLY: Create New User
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    console.log(`📡 Admin creating user: ${email} [${role}]`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database offline' });
    }

    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({ message: `Invalid role selected: ${role}` });
    }

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists in this role collection.' });
    }

    const newUser = new Model({
      email,
      password,
      role: role.toLowerCase(),
      profile: { firstName, lastName }
    });

    await newUser.save();
    console.log(`✅ Success: ${email} added to ${role} collection`);

    res.status(201).json({
      message: `${role.toUpperCase()} created successfully`
    });

  } catch (error) {
    console.error('🔥 Create User Error:', error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getMe = async (req, res) => {
  try {
    const role = req.user.role;
    const Model = getModelByRole(role);
    const user = await Model.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 🔐 SECURE: Update User Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const role = req.user.role;

    console.log(`🔐 [AUTH] Rotation check for role: ${role}, ID: ${req.user.id}`);

    const Model = getModelByRole(role);
    const user = await Model.findById(req.user.id);

    if (!user) {
      console.error('❌ [AUTH] Personnel node not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Challenge check: Current Password verification
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.warn('❌ [AUTH] Credential mismatch for current password challenge');
      return res.status(401).json({ message: 'Verification failed: Incorrect current password' });
    }

    // Protocol Update: Save new hashed password
    user.password = newPassword;
    await user.save();

    console.log('✅ [AUTH] Matrix updated: New password persisted to collection');
    res.json({ message: 'Security protocol updated successfully' });
  } catch (error) {
    console.error('🔥 [AUTH] System Protocol Error:', error);
    res.status(500).json({ message: `System Error: ${error.message}` });
  }
};
