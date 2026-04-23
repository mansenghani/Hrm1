const TimeTrack = require('../models/TimeTrack');
const User = require('../models/User');
const mongoose = require('mongoose');

const IDLE_THRESHOLD = 60; // 1 Minute (Testing)
// 🧠 IN-MEMORY MOCK STORE
let mockStore = {
    hasActiveSession: true,
    status: 'active',
    isRunning: true,
    startTime: new Date().toISOString(),
    totalActiveTime: 3600,
    activeTime: 3600,
    idleTime: 120,
    lastActiveTime: new Date().toISOString()
};

const getToday = () => new Date().toISOString().split('T')[0];
const isDBConnected = () => mongoose.connection.readyState === 1;

const updateMock = (action) => {
    const now = new Date();
    if (action === 'start') {
        mockStore = {
            hasActiveSession: true, status: 'active', isRunning: true, startTime: now.toISOString(),
            totalActiveTime: 0, activeTime: 0, idleTime: 0, lastActiveTime: now.toISOString()
        };
    } else if (action === 'pause') {
        const elapsed = Math.floor((now - new Date(mockStore.startTime)) / 1000);
        mockStore.totalActiveTime += elapsed;
        mockStore.activeTime = mockStore.totalActiveTime;
        mockStore.status = 'paused'; mockStore.isRunning = false;
        mockStore.lastActiveTime = now.toISOString();
    } else if (action === 'resume') {
        mockStore.startTime = now.toISOString();
        mockStore.status = 'active'; mockStore.isRunning = true;
        mockStore.lastActiveTime = now.toISOString();
    } else if (action === 'stop') {
        const elapsed = mockStore.isRunning ? Math.floor((now - new Date(mockStore.startTime)) / 1000) : 0;
        mockStore.totalActiveTime += elapsed;
        mockStore.activeTime = mockStore.totalActiveTime;
        mockStore.status = 'completed'; mockStore.isRunning = false; mockStore.hasActiveSession = false;
    }
    return mockStore;
};

// ==========================================
// 🔐 ROLE-BASED FILTERING HELPER
// ==========================================
const getRoleFilter = (user) => {
    if (user.role === 'admin') return {};
    if (user.role === 'hr') return { employeeRole: { $in: ['employee', 'manager'] } };
    if (user.role === 'manager') return { managerId: user.id };
    return { employeeId: user.id };
};

// ==========================================
// 🟢 START TRACKING
// ==========================================
exports.startTracking = async (req, res) => {
  try {
    if (!isDBConnected()) return res.status(201).json({ message: 'Mock Start Success', session: updateMock('start') });
    const { id, role } = req.user;
    const today = getToday();
    const now = new Date();
    let session = await TimeTrack.findOne({ employeeId: id, date: today, status: { $ne: 'completed' } });
    if (session) return res.status(400).json({ message: 'Session already active/paused', session });
    const userNode = await User.findById(id).select('reportingManager teamId');
    session = await TimeTrack.create({
      employeeId: id, employeeRole: role, managerId: userNode?.reportingManager || null,
      teamId: userNode?.teamId || null, date: today, startTime: now, lastActiveTime: now,
      status: 'active', isRunning: true, totalActiveTime: 0, sessions: [{ start: now }],
      activityLog: [{ timestamp: now, type: 'resume' }]
    });
    res.status(201).json({ message: 'Tracking started', session });
  } catch (error) { res.status(500).json({ message: 'Failed to start tracking', error: error.message }); }
};

// ==========================================
// ⏸️ PAUSE TRACKING
// ==========================================
exports.pauseTracking = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ message: 'Mock Pause Success', session: updateMock('pause') });
    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: 'active' });
    if (!session) return res.status(404).json({ message: 'No active session to pause' });
    
    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0) session.sessions[lastIdx].pause = now;

    // Calculate elapsed time from the start of the CURRENT segment
    if (session.startTime) {
      const startTime = new Date(session.startTime);
      if (!isNaN(startTime.getTime())) {
        const diff = Math.floor((now - startTime) / 1000);
        session.totalActiveTime += Math.max(0, diff);
      }
    }
    
    session.activeTime = session.totalActiveTime;
    session.status = 'paused'; 
    session.isRunning = false; 
    session.lastActiveTime = now;
    
    await session.save();
    res.json({ message: 'Tracking paused', session });
  } catch (error) { 
    console.error('Pause Error:', error);
    res.status(500).json({ message: 'Failed to pause tracking', error: error.message }); 
  }
};

// ==========================================
// ▶️ RESUME TRACKING
// ==========================================
exports.resumeTracking = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ message: 'Mock Resume Success', session: updateMock('resume') });
    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: 'paused' });
    if (!session) return res.status(404).json({ message: 'No paused session to resume' });
    
    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0 && session.sessions[lastIdx].pause && !session.sessions[lastIdx].resume) {
        session.sessions[lastIdx].resume = now;
    } else { 
      session.sessions.push({ start: now }); 
    }
    
    session.startTime = now; 
    session.status = 'active'; 
    session.isRunning = true; 
    session.lastActiveTime = now;
    
    await session.save();
    res.json({ message: 'Tracking resumed', session });
  } catch (error) { 
    console.error('Resume Error:', error);
    res.status(500).json({ message: 'Failed to resume tracking', error: error.message }); 
  }
};

// ==========================================
// 🔴 STOP TRACKING
// ==========================================
exports.stopTracking = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ message: 'Mock Stop Success', session: updateMock('stop') });
    const { id } = req.user;
    const now = new Date();
    const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: { $in: ['active', 'paused', 'idle'] } });
    if (!session) return res.status(404).json({ message: 'No session found' });
    
    const lastIdx = session.sessions.length - 1;
    if (lastIdx >= 0) {
      session.sessions[lastIdx].end = now;
      if (session.isRunning && session.startTime) {
        const startTime = new Date(session.startTime);
        if (!isNaN(startTime.getTime())) {
          const diff = Math.floor((now - startTime) / 1000);
          session.totalActiveTime += Math.max(0, diff);
        }
      }
    }
    
    session.endTime = now; 
    session.status = 'completed'; 
    session.isRunning = false;
    session.activeTime = session.totalActiveTime;
    
    await session.save();
    res.json({ message: 'Tracking stopped', session });
  } catch (error) { 
    console.error('Stop Error:', error);
    res.status(500).json({ message: 'Failed to stop tracking', error: error.message }); 
  }
};

// ==========================================
// 🔄 UPDATE ACTIVITY
// ==========================================
exports.updateActivity = async (req, res) => {
  try {
    if (!isDBConnected()) return res.json({ status: mockStore.status, isRunning: mockStore.isRunning });
    const { id } = req.user;
    const { type } = req.body;
    const now = new Date();
    const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: { $in: ['active', 'idle'] } });
    
    // Day Shift Check
    if (!session) {
       const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
       const oldSession = await TimeTrack.findOne({ employeeId: id, date: yesterday, status: { $in: ['active', 'idle'] } });
       if (oldSession) {
          oldSession.status = 'completed';
          oldSession.isRunning = false;
          oldSession.endTime = now;
          await oldSession.save();
          return res.json({ status: 'reload', message: 'Day shifted.' });
       }
       return res.status(404).json({ message: 'No active session' });
    }

    const sinceLast = Math.floor((now - new Date(session.lastActiveTime)) / 1000);

    if (type && type !== 'idle') {
      // USER IS ACTIVE
      if (session.status === 'idle') {
        // Just came back from idle
        session.idleTime += sinceLast;
        session.status = 'active';
        session.isRunning = true;
        session.startTime = now; // 🚀 RESET START TIME FOR FRONTEND SYNC
        
        // Log the return
        session.activityLog.push({ timestamp: now, type: 'resume' });
      } else {
        // Still active, accumulate time
        session.activeTime += sinceLast;
      }
      session.lastActiveTime = now;
    } else if (session.status === 'active' && sinceLast >= IDLE_THRESHOLD) {
      // USER JUST HIT IDLE THRESHOLD
      // Move the threshold duration to idle time as they've been inactive for that long
      session.idleTime += sinceLast;
      session.status = 'idle';
      session.isRunning = false;
      session.lastActiveTime = now;
      
      // Log idle start
      session.activityLog.push({ timestamp: now, type: 'idle_start' });
    }

    await session.save();
    res.json({ status: session.status, isRunning: session.isRunning, activeTime: session.activeTime, idleTime: session.idleTime });
  } catch (error) { res.status(500).json({ message: 'Heartbeat failed', error: error.message }); }
};

// ==========================================
// 📊 GET DATA VIEWS
// ==========================================
exports.getSessionStatus = async (req, res) => {
    try {
        if (!isDBConnected()) return res.json(mockStore);
        const { id } = req.user;
        const session = await TimeTrack.findOne({ employeeId: id, date: getToday(), status: { $ne: 'completed' } });
        if (!session) return res.json({ hasActiveSession: false });
        res.json({
            hasActiveSession: true, status: session.status,
            isRunning: session.isRunning !== undefined ? session.isRunning : (session.status === 'active'),
            startTime: session.startTime, totalActiveTime: session.totalActiveTime || session.activeTime || 0,
            activeTime: session.activeTime, idleTime: session.idleTime
        });
    } catch (error) { res.status(500).json({ message: 'Status check failed', error: error.message }); }
};

exports.getTimeSummary = async (req, res) => {
    try {
        if (!isDBConnected()) return res.json({
            stats: { active: 3600, idle: 120, total: 3720, productivity: 97 },
            chartData: [{ date: '2026-04-21', active: 1, idle: 0.1 }],
            logs: []
        });

        const filter = getRoleFilter(req.user);
        const sessions = await TimeTrack.find(filter).sort({ date: -1 }).limit(30);

        // 1. Calculate Stats (Today)
        const today = getToday();
        const todayData = sessions.filter(s => s.date === today);
        const stats = {
            active: todayData.reduce((acc, s) => acc + (s.activeTime || 0), 0),
            idle: todayData.reduce((acc, s) => acc + (s.idleTime || 0), 0),
            total: todayData.reduce((acc, s) => acc + (s.activeTime || 0), 0), // 'Total' reflects working hours as requested
            productivity: 0
        };
        const totalSessionTime = stats.active + stats.idle;
        if (totalSessionTime > 0) stats.productivity = Math.round((stats.active / totalSessionTime) * 100);

        // 2. Chart Data (Group by date)
        const chartMap = {};
        sessions.forEach(s => {
            if (!chartMap[s.date]) chartMap[s.date] = { date: s.date, active: 0, idle: 0 };
            chartMap[s.date].active += (s.activeTime || 0) / 3600;
            chartMap[s.date].idle += (s.idleTime || 0) / 3600;
        });
        const chartData = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

        res.json({ stats, chartData, logs: sessions.slice(0, 10) });
    } catch (error) { res.status(500).json({ message: 'Summary failed', error: error.message }); }
};

exports.getTimeByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const filter = { ...getRoleFilter(req.user), date };
        const logs = await TimeTrack.find(filter).populate('employeeId', 'fullName email');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Date fetch failed', error: error.message }); }
};

exports.getLogs = async (req, res) => {
    try {
        const filter = getRoleFilter(req.user);
        const logs = await TimeTrack.find(filter).sort({ createdAt: -1 }).populate('employeeId', 'fullName email');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Logs fetch failed', error: error.message }); }
};

exports.getMyTime = async (req, res) => {
    try {
        const logs = await TimeTrack.find({ employeeId: req.user.id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'My logs failed', error: error.message }); }
};

exports.getTeamTime = async (req, res) => {
    try {
        const logs = await TimeTrack.find({ managerId: req.user.id }).sort({ date: -1 }).populate('employeeId', 'fullName email');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Team logs failed', error: error.message }); }
};

exports.getHRTime = async (req, res) => {
    try {
        const logs = await TimeTrack.find({ employeeRole: { $in: ['employee', 'manager'] } }).sort({ date: -1 }).populate('employeeId', 'fullName email');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'HR logs failed', error: error.message }); }
};

exports.getAllTime = async (req, res) => {
    try {
        const logs = await TimeTrack.find({}).sort({ date: -1 }).populate('employeeId', 'fullName email');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'All logs failed', error: error.message }); }
};
