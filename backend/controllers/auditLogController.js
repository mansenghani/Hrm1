const AuditLog = require('../models/AuditLog');

// Log custom activity helper
exports.logActivity = async ({ userId, userName, userRole, action, module, description, ipAddress, req, status = 'Success', details = {} }) => {
  try {
    let device = 'Desktop';
    let browser = 'Chrome';
    let os = 'Windows';

    if (req) {
      const userAgent = req.headers['user-agent'] || '';
      ipAddress = ipAddress || req.ip || req.connection.remoteAddress;

      // Extract basic OS
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Macintosh')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; device = 'Mobile'; }

      // Extract basic Browser
      if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
    }

    const log = new AuditLog({
      userId,
      userName: userName || 'System',
      userRole: userRole || 'System',
      action,
      module,
      description,
      ipAddress: ipAddress || '127.0.0.1',
      device,
      browser,
      os,
      status,
      details
    });

    await log.save();
    return log;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

// Get all audit logs with filters and pagination
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, module, status, user, startDate, endDate } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } }
      ];
    }

    if (module && module !== 'All') {
      query.module = module;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (user) {
      query.userName = { $regex: user, $options: 'i' };
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skipIndex);

    const total = await AuditLog.countDocuments(query);

    // Calculate Summary Stats
    const totalActivities = await AuditLog.countDocuments();
    const successfulActions = await AuditLog.countDocuments({ status: 'Success' });
    const failedActions = await AuditLog.countDocuments({ status: 'Failed' });
    const warnings = await AuditLog.countDocuments({ status: 'Warning' });
    
    // Count unique active users in past 24 hours
    const activeUsersList = await AuditLog.distinct('userName', {
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const activeUsers = activeUsersList.length;

    // Count today's logs
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysCount = await AuditLog.countDocuments({
      timestamp: { $gte: startOfToday }
    });

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: {
        totalActivities,
        successfulActions,
        failedActions,
        warnings,
        activeUsers,
        todaysCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
