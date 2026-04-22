const User = require('../models/User');
const Employee = require('../models/Employee');
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
        { 
          id: user._id, 
          role: user.role, 
          name: user.name, 
          profileImage: user.profileImage 
        },
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
    const { firstName, lastName, email, password, role, status, joinDate } = req.body;
    const name = `${firstName} ${lastName}`.trim();

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database offline' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userRole = role || 'employee';

    const newUser = new User({
      name,
      email,
      password,
      role: userRole,
      status: status || 'active'
    });

    await newUser.save();

    // 👤 CREATE EMPLOYEE PROFILE AUTOMATICALLY
    const prefix = userRole === 'admin' ? 'ADM' : userRole === 'hr' ? 'HR' : userRole === 'manager' ? 'MGR' : 'EMP';
    const count = await Employee.countDocuments();
    const finalEmployeeId = `${prefix}-${String(count + 1).padStart(3, '0')}`;

    const newEmployee = new Employee({
      userId: newUser._id,
      email,
      fullName: name,
      role: userRole,
      employeeId: finalEmployeeId,
      joinDate: joinDate || new Date()
    });

    await newEmployee.save();
    
    return res.status(201).json({
      message: `${userRole} profile synchronized successfully`,
      user: { _id: newUser._id, email: newUser.email, role: newUser.role, employeeId: finalEmployeeId }
    });

  } catch (error) {
    console.error('🔥 Create User Error:', error);
    return res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 👤 DYNAMIC SHADOW LOOKUP: Fetch from the role-specific registry
    let shadowRegistry = 'Employee'; // Default
    if (user.role === 'hr') shadowRegistry = 'HR';
    if (user.role === 'manager') shadowRegistry = 'Manager';

    const shadowData = await mongoose.model(shadowRegistry).findOne({ userId: req.user.id }).lean();
    console.log(`[PROFILE TRACE] User Role: ${user.role} | Shadow Match: ${!!shadowData} | ID: ${shadowData?.employeeId}`);
    
    // Merge data - prioritizing User fields but adding all Shadow extra fields
    const profile = {
      ...user,
      ...shadowData, 
      employeeId: shadowData?.employeeId || user.employeeId || 'PENDING-SYNC', // Forced explicit mapping
      _id: user._id
    };

    res.json(profile);
  } catch (err) {
    console.error('🔥 Error in getMe:', err);
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

// 🖼️ PROFILE: Upload Image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    // Update User
    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: imagePath }, { new: true });
    
    // Update Shadow Registry (Employee/HR/Manager)
    let shadowRegistry = 'Employee';
    if (user.role === 'hr') shadowRegistry = 'HR';
    if (user.role === 'manager') shadowRegistry = 'Manager';

    const shadowModel = mongoose.model(shadowRegistry);
    await shadowModel.findOneAndUpdate({ userId: req.user.id }, { profileImage: imagePath });

    res.json({ 
      message: 'Profile image updated successfully',
      profileImage: imagePath 
    });
  } catch (error) {
    console.error('🔥 Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};
