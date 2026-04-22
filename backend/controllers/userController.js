const userService = require('../services/userService');

/**
 * 🛰️ USER CONTROLLER: Mission Control API
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, ...extraData } = req.body;

    // Phase 1: Heavy Field Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Incomplete Protocol: Identity name, email, keys, and role are mandatory' 
      });
    }

    // Phase 2: Transactional Core Execution
    const result = await userService.createNewUserAtomic({
      name, email, password, role, ...extraData
    });

    // Phase 3: Senior Standard Sync Response (Requirement: API Response Fix)
    // Explicitly mapping fields to match the requested JSON schema
    res.status(201).json({
      success: true,
      user: {
        id: result.user._id,
        profileId: result.employeeProfile?._id, // 🔥 CRITICAL SYNC: Return the profile ID for asset linkage
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        employeeId: result.user.employeeId,
        status: result.user.status.toUpperCase()
      }
    });

  } catch (error) {
    console.error('🔥 Personnel Genesis Failure:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Critical system failure during identity synchronization'
    });
  }
};
