/**
 * ============================================================
 * TIME ENGINE v2 — BACKEND AUTHORITY
 * ============================================================
 * Rules:
 *  - Backend is the ONLY source of truth
 *  - Frontend/Electron ONLY display values returned here
 *  - No local timer math anywhere
 *  - Idle time tracked as: inactivityCount × IDLE_THRESHOLD (deducted from activeTime)
 *  - All values stored in DB and returned on every poll
 * ============================================================
 */

const TimeTrack = require('../models/TimeTrack');
const User = require('../models/User');
const mongoose = require('mongoose');

// ── CONFIG ────────────────────────────────────────────────
const IDLE_THRESHOLD_SECONDS = 60; // 1 min test mode (change to 300 for 5 min prod)

// ── HELPERS ───────────────────────────────────────────────
const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isDBConnected = () => mongoose.connection.readyState === 1;

const getRoleFilter = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'hr') return { employeeRole: { $in: ['employee', 'manager'] } };
  if (user.role === 'manager') return { managerId: user.id };
  return { employeeId: user.id };
};

// ── MOCK (DB offline fallback) ────────────────────────────
let mock = {
  hasActiveSession: false, status: 'completed', isRunning: false,
  activeTime: 0, idleTime: 0, inactivityCount: 0
};

// ============================================================
// 🟢 START
// ============================================================
exports.startTracking = async (req, res) => {
  try {
    if (!isDBConnected()) {
      mock = { hasActiveSession: true, status: 'active', isRunning: true, activeTime: 0, idleTime: 0, inactivityCount: 0, startTime: new Date() };
      return res.status(201).json({ message: 'Mock start', session: mock });
    }

    const { id, role } = req.user;
    const today = getToday();
    const now = new Date();
    const userNode = await User.findById(id).select('reportingManager teamId');

    // Close any stale session from a previous day
    await TimeTrack.updateMany(
      { employeeId: id, date: { $ne: today }, status: { $in: ['active', 'idle', 'paused'] } },
      { $set: { status: 'completed', isRunning: false, endTime: now } }
    );

    let session = await TimeTrack.findOne({ employeeId: id, date: today });

    if (session) {
      // Resume existing day session
      session.status = 'active';
      session.isRunning = true;
      session.segmentStart = now;       // start of THIS active segment
      session.lastHeartbeat = now;
      session.idleApplied = false;
      session.sessions.push({ start: now });
      session.activityLog.push({ timestamp: now, type: 'resume' });
    } else {
      session = new TimeTrack({
        employeeId: id,
        employeeRole: role || 'employee',
        managerId: userNode?.reportingManager || null,
        teamId: userNode?.teamId || null,
        date: today,
        startTime: now,
        segmentStart: now,
        lastHeartbeat: now,
        status: 'active',
        isRunning: true,
        activeTime: 0,
        idleTime: 0,
        inactivityCount: 0,
        sessions: [{ start: now }],
        activityLog: [{ timestamp: now, type: 'start' }]
      });
    }

    await session.save();

    const io = req.app.get('io');
    if (io) io.to(`user_${id}`).emit('timer_update', buildPayload(session));

    res.status(201).json({ message: 'Tracking started', session: buildPayload(session) });
  } catch (err) {
    console.error('[START ERROR]', err);
    res.status(500).json({ message: 'Failed to start tracking', error: err.message });
  }
};

// ============================================================
// ⏸️ PAUSE (manual)
// ============================================================
exports.pauseTracking = async (req, res) => {
  try {
    if (!isDBConnected()) {
      mock.status = 'paused'; mock.isRunning = false;
      return res.json({ message: 'Mock pause', session: mock });
    }

    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: 'active' });
    if (!session) return res.status(404).json({ message: 'No active session to pause' });

    // Commit the current active segment to activeTime
    session.activeTime += flushSegment(session, now);
    session.segmentStart = null;
    session.status = 'paused';
    session.isRunning = false;
    session.lastHeartbeat = now;
    session.idleApplied = false;

    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0) session.sessions[lastIdx].pause = now;
    session.activityLog.push({ timestamp: now, type: 'pause' });

    await session.save();

    const io = req.app.get('io');
    if (io) io.to(`user_${id}`).emit('timer_paused', { reason: 'manual', ...buildPayload(session) });

    res.json({ message: 'Tracking paused', session: buildPayload(session) });
  } catch (err) {
    console.error('[PAUSE ERROR]', err);
    res.status(500).json({ message: 'Failed to pause', error: err.message });
  }
};

// ============================================================
// ▶️ RESUME (manual)
// ============================================================
exports.resumeTracking = async (req, res) => {
  try {
    if (!isDBConnected()) {
      mock.status = 'active'; mock.isRunning = true;
      return res.json({ message: 'Mock resume', session: mock });
    }

    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({
      employeeId: id, date: getToday(), status: { $in: ['paused', 'idle'] }
    });
    if (!session) return res.status(404).json({ message: 'No paused session to resume' });

    // idleTime is tracked by inactivityCount × IDLE_THRESHOLD — nothing to add on resume
    session.status = 'active';
    session.isRunning = true;
    session.segmentStart = now;
    session.lastHeartbeat = now;
    session.idleApplied = false;

    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0 && session.sessions[lastIdx].pause && !session.sessions[lastIdx].resume) {
      session.sessions[lastIdx].resume = now;
    } else {
      session.sessions.push({ start: now });
    }
    session.activityLog.push({ timestamp: now, type: 'resume' });

    await session.save();

    const io = req.app.get('io');
    if (io) io.to(`user_${id}`).emit('timer_resumed', buildPayload(session));

    res.json({ message: 'Tracking resumed', session: buildPayload(session) });
  } catch (err) {
    console.error('[RESUME ERROR]', err);
    res.status(500).json({ message: 'Failed to resume', error: err.message });
  }
};

// ============================================================
// 🔴 STOP
// ============================================================
exports.stopTracking = async (req, res) => {
  try {
    if (!isDBConnected()) {
      mock.status = 'completed'; mock.isRunning = false; mock.hasActiveSession = false;
      return res.json({ message: 'Mock stop', session: mock });
    }

    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({
      employeeId: id, date: getToday(), status: { $in: ['active', 'paused', 'idle'] }
    });
    if (!session) return res.status(404).json({ message: 'No session to stop' });

    // Commit final active segment
    if (session.status === 'active') {
      session.activeTime += flushSegment(session, now);
    }

    session.segmentStart = null;
    session.endTime = now;
    session.status = 'completed';
    session.isRunning = false;

    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0) session.sessions[lastIdx].end = now;
    session.activityLog.push({ timestamp: now, type: 'stop' });

    await session.save();
    res.json({ message: 'Tracking stopped', session: buildPayload(session) });
  } catch (err) {
    console.error('[STOP ERROR]', err);
    res.status(500).json({ message: 'Failed to stop', error: err.message });
  }
};

// ============================================================
// 🔄 HEARTBEAT / ACTIVITY UPDATE
// ============================================================
exports.updateActivity = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json(mock);

    const { id } = req.user;
    const { type } = req.body;
    const now = new Date();

    const session = await TimeTrack.findOne({
      employeeId: id, date: getToday(), status: { $in: ['active', 'idle', 'paused'] }
    });

    if (!session) {
      // Auto-close stale yesterday session
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      await TimeTrack.updateMany(
        { employeeId: id, date: yesterday, status: { $in: ['active', 'idle'] } },
        { $set: { status: 'completed', isRunning: false, endTime: now } }
      );
      return res.status(404).json({ message: 'No active session' });
    }

    const normalizedType = String(type || '').toLowerCase();
    const isActiveSignal = ['mouse', 'keyboard', 'click', 'scroll', 'touch', 'focus', 'tab', 'heartbeat', 'active'].includes(normalizedType);
    const isIdleSignal = normalizedType === 'idle';

    if (session.status === 'active') {
      const sinceHeartbeat = session.lastHeartbeat
        ? (now - new Date(session.lastHeartbeat)) / 1000
        : 0;

      if (isActiveSignal && sinceHeartbeat < IDLE_THRESHOLD_SECONDS) {
        // ── Normal active heartbeat ──
        // Commit elapsed seconds since last heartbeat to activeTime (high precision)
        session.activeTime += Math.max(0, sinceHeartbeat);
        session.lastHeartbeat = now;

        if (!['heartbeat', 'active'].includes(normalizedType)) {
          session.activityLog.push({ timestamp: now, type: normalizedType });
        }

      } else if (isIdleSignal || sinceHeartbeat >= IDLE_THRESHOLD_SECONDS) {
        // ── Idle transition ──
        if (!session.idleApplied) {
          // ✅ Dynamic Rewind: Subtract the EXACT seconds of idleness reported by the OS
          // This eliminates gaps caused by heartbeat delays or network latency.
          const rewindAmount = Math.max(IDLE_THRESHOLD_SECONDS, req.body.idleSeconds || 0);
          
          session.activeTime += Math.max(0, sinceHeartbeat);
          session.activeTime = Math.max(0, session.activeTime - rewindAmount);
          
          session.inactivityCount += 1;
          session.idleTime = session.inactivityCount * IDLE_THRESHOLD_SECONDS;
          session.idleApplied = true;

          console.log(`[IDLE DYNAMIC] User ${id} — rewound by ${rewindAmount}s to ${session.activeTime}s`);
        }

        session.status = 'idle';
        session.isRunning = false;
        session.segmentStart = null;
        session.lastHeartbeat = now;
        session.activityLog.push({ timestamp: now, type: 'idle_start' });

        await session.save();

        const io = req.app.get('io');
        if (io) {
          io.to(`user_${id}`).emit('timer_paused', {
            reason: 'inactivity',
            employeeId: id,
            ...buildPayload(session)
          });
        }

        return res.json(buildPayload(session));
      }

    } else if (session.status === 'idle') {
      // While idle, just update heartbeat timestamp — no math
      session.lastHeartbeat = now;
    }

    await session.save();
    res.json(buildPayload(session));
  } catch (err) {
    console.error('[HEARTBEAT ERROR]', err);
    res.status(500).json({ message: 'Heartbeat failed', error: err.message });
  }
};

// ============================================================
// 📡 GET SESSION STATUS  (frontend polls this every second)
// ============================================================
exports.getSessionStatus = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ hasActiveSession: false, ...mock });

    const { id } = req.user;
    const session = await TimeTrack.findOne({
      employeeId: id, date: getToday(), status: { $ne: 'completed' }
    });

    if (!session) return res.json({ hasActiveSession: false });

    // ── Live active time ──
    // If session is active, add seconds elapsed since last heartbeat (high precision)
    let liveActiveTime = session.activeTime || 0;
    if (session.status === 'active' && session.lastHeartbeat) {
      const elapsed = (new Date() - new Date(session.lastHeartbeat)) / 1000;
      // Only add if within threshold (prevents runaway if heartbeat stopped)
      if (elapsed < IDLE_THRESHOLD_SECONDS) {
        liveActiveTime += elapsed;
      }
    }
    
    // Floor only at the last moment for the response
    res.json({
      hasActiveSession: true,
      status: session.status,
      isRunning: session.isRunning,
      activeTime: Math.floor(liveActiveTime),
      idleTime: Math.floor(session.idleTime || 0),
      inactivityCount: session.inactivityCount || 0,
      startTime: session.startTime,
      lastHeartbeat: session.lastHeartbeat
    });
  } catch (err) {
    console.error('[STATUS ERROR]', err);
    res.status(500).json({ message: 'Status check failed', error: err.message });
  }
};

// ============================================================
// 📊 ANALYTICS / VIEWS  (unchanged logic, just cleaner)
// ============================================================
exports.getTimeSummary = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ stats: { active: 0, idle: 0, total: 0, productivity: 0 }, chartData: [], logs: [] });

    const filter = getRoleFilter(req.user);
    const sessions = await TimeTrack.find(filter).sort({ date: -1 }).limit(30);
    const today = getToday();
    const todayData = sessions.filter(s => s.date === today);

    const stats = {
      active: todayData.reduce((a, s) => a + (s.activeTime || 0), 0),
      idle: todayData.reduce((a, s) => a + (s.idleTime || 0), 0),
      total: todayData.reduce((a, s) => a + (s.activeTime || 0) + (s.idleTime || 0), 0),
      productivity: 0
    };
    const total = stats.active + stats.idle;
    if (total > 0) stats.productivity = Math.round((stats.active / total) * 100);

    const chartMap = {};
    sessions.forEach(s => {
      if (!chartMap[s.date]) chartMap[s.date] = { date: s.date, active: 0, idle: 0 };
      chartMap[s.date].active += (s.activeTime || 0) / 3600;
      chartMap[s.date].idle += (s.idleTime || 0) / 3600;
    });

    res.json({ stats, chartData: Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date)), logs: sessions.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ message: 'Summary failed', error: err.message });
  }
};

exports.getTimeByDate = async (req, res) => {
  try {
    const filter = { ...getRoleFilter(req.user), date: req.params.date };
    res.json(await TimeTrack.find(filter).populate('employeeId', 'fullName email'));
  } catch (err) { res.status(500).json({ message: 'Date fetch failed', error: err.message }); }
};

exports.getLogs = async (req, res) => {
  try {
    res.json(await TimeTrack.find(getRoleFilter(req.user)).sort({ createdAt: -1 }).populate('employeeId', 'fullName email'));
  } catch (err) { res.status(500).json({ message: 'Logs failed', error: err.message }); }
};

exports.getMyTime = async (req, res) => {
  try {
    res.json(await TimeTrack.find({ employeeId: req.user.id }).sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: 'My logs failed', error: err.message }); }
};

exports.getTeamTime = async (req, res) => {
  try {
    res.json(await TimeTrack.find({ managerId: req.user.id }).sort({ date: -1 }).populate('employeeId', 'fullName email'));
  } catch (err) { res.status(500).json({ message: 'Team logs failed', error: err.message }); }
};

exports.getHRTime = async (req, res) => {
  try {
    res.json(await TimeTrack.find({ employeeRole: { $in: ['employee', 'manager'] } }).sort({ date: -1 }).populate('employeeId', 'fullName email'));
  } catch (err) { res.status(500).json({ message: 'HR logs failed', error: err.message }); }
};

exports.getAllTime = async (req, res) => {
  try {
    res.json(await TimeTrack.find({}).sort({ date: -1 }).populate('employeeId', 'fullName email'));
  } catch (err) { res.status(500).json({ message: 'All logs failed', error: err.message }); }
};

exports.getDashboardData = async (req, res) => {
  try {
    const { timeRange, userFilter, roleFilter } = req.query;
    let filter = getRoleFilter(req.user);
    if (userFilter) filter.employeeId = userFilter;
    if (roleFilter) filter.employeeRole = roleFilter;

    const now = new Date();
    const today = getToday();
    if (timeRange === 'weekly') {
      const d = new Date(); d.setDate(now.getDate() - 7);
      filter.date = { $gte: d.toISOString().split('T')[0] };
    } else if (timeRange === 'monthly') {
      const d = new Date(); d.setMonth(now.getMonth() - 1);
      filter.date = { $gte: d.toISOString().split('T')[0] };
    } else {
      filter.date = today;
    }

    const sessions = await TimeTrack.find(filter).sort({ date: -1, createdAt: -1 }).populate('employeeId', 'fullName email role');
    const stats = {
      totalTime: sessions.reduce((a, s) => a + (s.activeTime || 0) + (s.idleTime || 0), 0),
      activeTime: sessions.reduce((a, s) => a + (s.activeTime || 0), 0),
      idleTime: sessions.reduce((a, s) => a + (s.idleTime || 0), 0),
      sessions: sessions.length
    };

    const chartMap = {};
    sessions.forEach(s => {
      if (!chartMap[s.date]) chartMap[s.date] = { date: s.date, active: 0, idle: 0, total: 0 };
      chartMap[s.date].active += (s.activeTime || 0) / 3600;
      chartMap[s.date].idle += (s.idleTime || 0) / 3600;
      chartMap[s.date].total += ((s.activeTime || 0) + (s.idleTime || 0)) / 3600;
    });

    res.json({
      stats,
      chartData: Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date)),
      tableData: sessions.map(s => ({
        id: s._id, name: s.employeeId?.fullName || 'Unknown',
        role: s.employeeId?.role || s.employeeRole || 'N/A',
        status: s.status, todayHours: s.activeTime, lastActivity: s.lastHeartbeat
      })),
      activityLogs: sessions.slice(0, 10).map(s => ({
        name: s.employeeId?.fullName || 'Unknown', date: s.date,
        activeTime: s.activeTime, status: s.status
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard failed', error: err.message });
  }
};

// ============================================================
// 🔧 INTERNAL HELPERS
// ============================================================

/**
 * Flush the current active segment: returns seconds elapsed since segmentStart.
 * Does NOT mutate session — caller adds the result to session.activeTime.
 */
function flushSegment(session, now) {
  if (!session.segmentStart) return 0;
  const elapsed = Math.floor((now - new Date(session.segmentStart)) / 1000);
  return Math.max(0, elapsed);
}

/**
 * Build the authoritative payload returned to frontend/Electron.
 * Frontend MUST display these values directly — no local math.
 */
function buildPayload(session) {
  return {
    hasActiveSession: session.status !== 'completed',
    status: session.status,
    isRunning: session.isRunning,
    activeTime: Math.floor(session.activeTime || 0),
    idleTime: Math.floor(session.idleTime || 0),
    inactivityCount: session.inactivityCount || 0,
    startTime: session.startTime,
    lastHeartbeat: session.lastHeartbeat
  };
}
