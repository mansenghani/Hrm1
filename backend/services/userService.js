const mongoose = require('mongoose');
const User = require('../models/User');
const HR = require('../models/HR');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');

/**
 * 🛠️ SENIOR FULL-STACK: ATOMIC USER GENESIS
 * Goal: Transactional creation of User + Role Record + Instant ID Sync
 */
exports.createNewUserAtomic = async (userData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, role, ...extraData } = userData;

    // 1. Uniqueness Protocol
    const existing = await User.findOne({ email }).session(session);
    if (existing) throw new Error('Identity conflict: Email already registered in pulse registry');

    // 2. Strict ID Generation (Format: hr-004.hr)
    const roleMatch = role.toLowerCase();
    const count = await User.countDocuments({ role: roleMatch }).session(session);
    const generatedId = `${roleMatch}-${String(count + 1).padStart(3, '0')}.${roleMatch}`;

    // 3. Root User Creation (Goal Component c)
    const user = new User({ 
        name, 
        email, 
        password, 
        role: role.toLowerCase(), 
        employeeId: generatedId,
        status: 'active' 
    });
    await user.save({ session });

    // 4. Personnel Profile & Role-Based Shadow Insertion
    // 🛡️ UNIFIED REGISTRY: Everyone gets a base Employee profile for the Personnel Registry
    const employeeProfile = new Employee({ 
        userId: user._id,
        fullName: name,
        email: email,
        employeeId: generatedId,
        role: role.toLowerCase(),
        joinDate: userData.joinDate || new Date(),
        reportingManager: userData.reportingManager || null,
        ...extraData 
    });
    await employeeProfile.save({ session });

    let roleData = null;
    const shadowBase = { userId: user._id, ...extraData };

    switch (role.toLowerCase()) {
      case 'hr':
        roleData = new HR({ ...shadowBase, hrId: generatedId });
        break;
      case 'manager':
        roleData = new Manager({ ...shadowBase });
        break;
      case 'employee':
        // Profile already created above as base
        roleData = employeeProfile;
        break;
      default:
        // Admin or fallback
        break;
    }

    if (roleData && role.toLowerCase() !== 'employee') {
      await roleData.save({ session });
    }

    // 5. Atomic Commit Hub
    await session.commitTransaction();
    return { user, roleData, employeeProfile };

  } catch (error) {
    // 🔙 Automated Rollback on System Failure
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
