const TimeTrack = require('../models/TimeTrack');
const EmployeeUser = require('../models/EmployeeUser');
const Manager = require('../models/Manager');
const HR = require('../models/HR');
const Admin = require('../models/Admin');

const IDLE_THRESHOLD = 5 * 60; // 5 minutes in seconds

// Helper: Get model name from role
const getModelName = (role) => {
  const map = { employee: 'EmployeeUser', manager: 'Manager', hr: 'HR', admin: 'Admin' };
  return map[role] || 'EmployeeUser';
};

// Helper: Get today's date string
const getToday = () => new Date().toISOString().split('T')[0];

// Helper: Populate employee name from the right collection
const populateEmployeeInfo = async (sessions) => {
  const populated = [];
  for (const session of sessions) {
    const s = session.toObject ? session.toObject() : { ...session };
    let userInfo = null;
    try {
      switch (s.employeeModel) {
        case 'EmployeeUser':
          userInfo = await EmployeeUser.findById(s.employeeId).select('email profile role').lean();
          break;
        case 'Manager':
          userInfo = await Manager.findById(s.employeeId).select('email profile role').lean();
          break;
        case 'HR':
          userInfo = await HR.findById(s.employeeId).select('email profile role').lean();
          break;
        case 'Admin':
          userInfo = await Admin.findById(s.employeeId).select('email profile role').lean();
          break;
      }
    } catch (e) { /* skip */ }
    s.employeeInfo = userInfo || { email: 'Unknown', profile: { firstName: 'Unknown', lastName: '' }, role: s.employeeRole };
    populated.push(s);
  }
  return populated;
};


// ==========================================
// 🟢 START TRACKING
// POST /api/time/start
// ==========================================
exports.startTracking = async (req, res) => {
  try {
    const { id, role } = req.user;
    const today = getToday();

    // Check if there's already an active session today
    const existing = await TimeTrack.findOne({
      employeeId: id,
      date: today,
      status: { $in: ['active', 'idle'] }
    });

    if (existing) {
      return res.status(400).json({
        message: 'Session already active. Stop current session first.',
        session: existing
      });
    }

    // Get managerId for employees
    let managerId = null;
    if (role === 'employee') {
      const emp = await EmployeeUser.findById(id).select('managerId');
      managerId = emp?.managerId || null;
    }

    const session = await TimeTrack.create({
      employeeId: id,
      employeeModel: getModelName(role),
      employeeRole: role,
      managerId,
      date: today,
      startTime: new Date(),
      lastActivityAt: new Date(),
      status: 'active',
      activeTime: 0,
      idleTime: 0,
      activityLog: [{ timestamp: new Date(), type: 'resume' }]
    });

    res.status(201).json({
      message: 'Time tracking started',
      session
    });
  } catch (error) {
    console.error('Start Tracking Error:', error);
    res.status(500).json({ message: 'Failed to start tracking', error: error.message });
  }
};


// ==========================================
// 🔴 STOP TRACKING
// POST /api/time/stop
// ==========================================
exports.stopTracking = async (req, res) => {
  try {
    const { id } = req.user;
    const today = getToday();

    const session = await TimeTrack.findOne({
      employeeId: id,
      date: today,
      status: { $in: ['active', 'idle'] }
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    const now = new Date();
    const lastActivity = new Date(session.lastActivityAt);
    const sinceLastActivity = Math.floor((now - lastActivity) / 1000);

    // If they were active, add remaining active time
    if (session.status === 'active') {
      const additionalActive = Math.min(sinceLastActivity, IDLE_THRESHOLD);
      session.activeTime += additionalActive;
      // If they went beyond idle threshold, add idle time
      if (sinceLastActivity > IDLE_THRESHOLD) {
        session.idleTime += (sinceLastActivity - IDLE_THRESHOLD);
      }
    } else {
      // They were idle, add all remaining as idle
      session.idleTime += sinceLastActivity;
    }

    session.endTime = now;
    session.status = 'completed';
    await session.save();

    res.json({
      message: 'Time tracking stopped',
      session
    });
  } catch (error) {
    console.error('Stop Tracking Error:', error);
    res.status(500).json({ message: 'Failed to stop tracking', error: error.message });
  }
};


// ==========================================
// 🔄 UPDATE ACTIVITY (Heart Beat)
// POST /api/time/activity
// Called every 10-30 seconds from frontend
// ==========================================
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.user;
    const { type } = req.body; // 'mouse', 'keyboard', 'tab'
    const today = getToday();

    const session = await TimeTrack.findOne({
      employeeId: id,
      date: today,
      status: { $in: ['active', 'idle'] }
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    const now = new Date();
    const lastActivity = new Date(session.lastActivityAt);
    const sinceLastActivity = Math.floor((now - lastActivity) / 1000);

    if (type && type !== 'idle') {
      // ✅ REAL ACTIVITY DETECTED
      if (session.status === 'idle') {
        // Was idle → now resuming
        session.idleTime += sinceLastActivity;
        session.status = 'active';
        session.activityLog.push({ timestamp: now, type: 'resume' });
      } else {
        // Was active → still active
        session.activeTime += sinceLastActivity;
      }
      session.lastActivityAt = now;
      session.activityLog.push({ timestamp: now, type: type || 'mouse' });
    } else {
      // ❌ NO ACTIVITY (idle heartbeat)
      if (session.status === 'active' && sinceLastActivity >= IDLE_THRESHOLD) {
        // Was active but exceeded idle threshold → transition to idle
        // Add the active portion (up to threshold) as active time
        session.activeTime += IDLE_THRESHOLD;
        // The rest is idle
        session.idleTime += (sinceLastActivity - IDLE_THRESHOLD);
        session.status = 'idle';
        session.activityLog.push({ timestamp: now, type: 'idle_start' });
      } else if (session.status === 'active') {
        // Still within active window, add as active
        session.activeTime += sinceLastActivity;
        session.lastActivityAt = now;
      } else {
        // Already idle, accumulate idle time
        session.idleTime += sinceLastActivity;
        session.lastActivityAt = now;
      }
    }

    // Keep activity log manageable (max 500 entries)
    if (session.activityLog.length > 500) {
      session.activityLog = session.activityLog.slice(-200);
    }

    await session.save();

    res.json({
      status: session.status,
      activeTime: session.activeTime,
      idleTime: session.idleTime,
      lastActivityAt: session.lastActivityAt
    });
  } catch (error) {
    console.error('Activity Update Error:', error);
    res.status(500).json({ message: 'Failed to update activity', error: error.message });
  }
};


// ==========================================
// 📋 GET MY TIME (Employee / Self)
// GET /api/time/my?date=YYYY-MM-DD
// ==========================================
exports.getMyTime = async (req, res) => {
  try {
    const { id } = req.user;
    const date = req.query.date || getToday();

    const sessions = await TimeTrack.find({
      employeeId: id,
      date
    }).sort({ startTime: -1 });

    // Also get weekly summary
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekDateStr = weekStart.toISOString().split('T')[0];

    const weeklySessions = await TimeTrack.find({
      employeeId: id,
      date: { $gte: weekDateStr }
    }).sort({ date: -1 });

    const weeklyStats = weeklySessions.reduce((acc, s) => {
      acc.totalActive += s.activeTime;
      acc.totalIdle += s.idleTime;
      acc.sessions += 1;
      return acc;
    }, { totalActive: 0, totalIdle: 0, sessions: 0 });

    res.json({
      today: sessions,
      weeklyStats
    });
  } catch (error) {
    console.error('Get My Time Error:', error);
    res.status(500).json({ message: 'Failed to fetch time data', error: error.message });
  }
};


// ==========================================
// 👨‍💼 MANAGER VIEW (Team Only)
// GET /api/time/team?date=YYYY-MM-DD
// ==========================================
exports.getTeamTime = async (req, res) => {
  try {
    const { id } = req.user;
    const date = req.query.date || getToday();

    // Find employees under this manager
    const sessions = await TimeTrack.find({
      managerId: id,
      date
    }).sort({ startTime: -1 });

    const populated = await populateEmployeeInfo(sessions);

    res.json(populated);
  } catch (error) {
    console.error('Get Team Time Error:', error);
    res.status(500).json({ message: 'Failed to fetch team time', error: error.message });
  }
};


// ==========================================
// 🧑‍💼 HR VIEW (All employees + managers)
// GET /api/time/hr?date=YYYY-MM-DD
// ==========================================
exports.getHRTime = async (req, res) => {
  try {
    const date = req.query.date || getToday();

    const sessions = await TimeTrack.find({
      date,
      employeeRole: { $in: ['employee', 'manager'] }
    }).sort({ startTime: -1 });

    const populated = await populateEmployeeInfo(sessions);

    res.json(populated);
  } catch (error) {
    console.error('Get HR Time Error:', error);
    res.status(500).json({ message: 'Failed to fetch HR time view', error: error.message });
  }
};


// ==========================================
// 👑 ADMIN VIEW (Full access)
// GET /api/time/all?date=YYYY-MM-DD
// ==========================================
exports.getAllTime = async (req, res) => {
  try {
    const date = req.query.date || getToday();

    const sessions = await TimeTrack.find({ date }).sort({ startTime: -1 });
    const populated = await populateEmployeeInfo(sessions);

    // Analytics
    const totalActive = sessions.reduce((sum, s) => sum + s.activeTime, 0);
    const totalIdle = sessions.reduce((sum, s) => sum + s.idleTime, 0);
    const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'idle').length;

    // Top performers (most active time)
    const performerMap = {};
    for (const s of populated) {
      const key = s.employeeId.toString();
      if (!performerMap[key]) {
        performerMap[key] = {
          employeeInfo: s.employeeInfo,
          totalActive: 0,
          totalIdle: 0,
          role: s.employeeRole
        };
      }
      performerMap[key].totalActive += s.activeTime;
      performerMap[key].totalIdle += s.idleTime;
    }

    const topPerformers = Object.values(performerMap)
      .sort((a, b) => b.totalActive - a.totalActive)
      .slice(0, 10);

    res.json({
      sessions: populated,
      analytics: {
        totalSessions: sessions.length,
        activeSessions,
        totalActive,
        totalIdle,
        activeRatio: totalActive + totalIdle > 0
          ? Math.round((totalActive / (totalActive + totalIdle)) * 100)
          : 0,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Get All Time Error:', error);
    res.status(500).json({ message: 'Failed to fetch all time data', error: error.message });
  }
};


// ==========================================
// 📊 GET CURRENT SESSION STATUS
// GET /api/time/status
// ==========================================
exports.getSessionStatus = async (req, res) => {
  try {
    const { id } = req.user;
    const today = getToday();

    const session = await TimeTrack.findOne({
      employeeId: id,
      date: today,
      status: { $in: ['active', 'idle'] }
    });

    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    // Recalculate current times
    const now = new Date();
    const lastActivity = new Date(session.lastActivityAt);
    const sinceLastActivity = Math.floor((now - lastActivity) / 1000);

    let currentActive = session.activeTime;
    let currentIdle = session.idleTime;
    let currentStatus = session.status;

    if (session.status === 'active') {
      if (sinceLastActivity >= IDLE_THRESHOLD) {
        currentActive += IDLE_THRESHOLD;
        currentIdle += (sinceLastActivity - IDLE_THRESHOLD);
        currentStatus = 'idle';
      } else {
        currentActive += sinceLastActivity;
      }
    } else {
      currentIdle += sinceLastActivity;
    }

    res.json({
      hasActiveSession: true,
      sessionId: session._id,
      status: currentStatus,
      activeTime: currentActive,
      idleTime: currentIdle,
      startTime: session.startTime,
      lastActivityAt: session.lastActivityAt
    });
  } catch (error) {
    console.error('Get Status Error:', error);
    res.status(500).json({ message: 'Failed to get session status', error: error.message });
  }
};
