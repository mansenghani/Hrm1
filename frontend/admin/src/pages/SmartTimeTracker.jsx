import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Play, Square, Clock, Activity, Zap, Timer, TrendingUp,
  AlertTriangle, CheckCircle, MousePointer, Keyboard, Monitor,
  BarChart3, ArrowUpRight, Users, User, Shield, Eye
} from 'lucide-react';

const HEARTBEAT_INTERVAL = 15000; // 15 seconds
const IDLE_CHECK_INTERVAL = 10000; // 10 seconds
const IDLE_THRESHOLD = 300; // 5 minutes in seconds
const API_BASE = 'http://localhost:5000/api/time';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatMinutes = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const SmartTimeTracker = () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const headers = { Authorization: `Bearer ${token}` };

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('inactive'); // active, idle, inactive
  const [activeTime, setActiveTime] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ totalActive: 0, totalIdle: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Team/HR/Admin data
  const [teamData, setTeamData] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  // Activity detection refs
  const lastActivityRef = useRef(Date.now());
  const heartbeatRef = useRef(null);
  const timerRef = useRef(null);
  const activityTypeRef = useRef(null);

  // =========================================
  // 🧠 ACTIVITY DETECTION
  // =========================================
  const handleUserActivity = useCallback((type) => {
    lastActivityRef.current = Date.now();
    activityTypeRef.current = type;
    if (sessionStatus === 'idle') {
      setSessionStatus('active');
    }
  }, [sessionStatus]);

  useEffect(() => {
    const onMouse = () => handleUserActivity('mouse');
    const onKey = () => handleUserActivity('keyboard');
    const onFocus = () => handleUserActivity('tab');
    const onClick = () => handleUserActivity('mouse');
    const onScroll = () => handleUserActivity('mouse');

    if (isTracking) {
      window.addEventListener('mousemove', onMouse);
      window.addEventListener('keydown', onKey);
      window.addEventListener('focus', onFocus);
      window.addEventListener('click', onClick);
      window.addEventListener('scroll', onScroll);
    }

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isTracking, handleUserActivity]);

  // =========================================
  // ⏱️ LOCAL TIMER (visual countdown)
  // =========================================
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const sinceLast = Math.floor((now - lastActivityRef.current) / 1000);

        if (sinceLast >= IDLE_THRESHOLD) {
          setSessionStatus('idle');
          setIdleTime(prev => prev + 1);
        } else {
          setSessionStatus('active');
          setActiveTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTracking]);

  // =========================================
  // 💓 HEARTBEAT (send activity to server)
  // =========================================
  useEffect(() => {
    if (isTracking) {
      heartbeatRef.current = setInterval(async () => {
        try {
          const sinceLast = Math.floor((Date.now() - lastActivityRef.current) / 1000);
          const type = sinceLast >= IDLE_THRESHOLD ? 'idle' : (activityTypeRef.current || 'mouse');

          await axios.post(`${API_BASE}/activity`, { type }, { headers });
          activityTypeRef.current = null; // reset
        } catch (err) {
          console.error('Heartbeat failed:', err);
        }
      }, HEARTBEAT_INTERVAL);
    } else {
      clearInterval(heartbeatRef.current);
    }

    return () => clearInterval(heartbeatRef.current);
  }, [isTracking]);

  // =========================================
  // 🔄 INITIAL LOAD
  // =========================================
  useEffect(() => {
    fetchStatus();
    fetchMyTime();
    if (role === 'manager' || role === 'admin') fetchTeamData();
    if (role === 'hr' || role === 'admin') fetchHRData();
    if (role === 'admin') fetchAdminData();
  }, [viewDate]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/status`, { headers });
      if (res.data.hasActiveSession) {
        setIsTracking(true);
        setSessionStatus(res.data.status);
        setActiveTime(res.data.activeTime);
        setIdleTime(res.data.idleTime);
        setStartTime(res.data.startTime);
        lastActivityRef.current = new Date(res.data.lastActivityAt).getTime();
      }
    } catch (err) {
      console.error('Status fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTime = async () => {
    try {
      const res = await axios.get(`${API_BASE}/my?date=${viewDate}`, { headers });
      setTodaySessions(res.data.today || []);
      setWeeklyStats(res.data.weeklyStats || { totalActive: 0, totalIdle: 0, sessions: 0 });
    } catch (err) { console.error(err); }
  };

  const fetchTeamData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/team?date=${viewDate}`, { headers });
      setTeamData(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchHRData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hr?date=${viewDate}`, { headers });
      if (role === 'hr') setTeamData(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAdminData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/all?date=${viewDate}`, { headers });
      setAdminAnalytics(res.data.analytics);
      setTeamData(res.data.sessions || []);
    } catch (err) { console.error(err); }
  };

  // =========================================
  // 🎮 CONTROLS
  // =========================================
  const handleStart = async () => {
    try {
      setError('');
      const res = await axios.post(`${API_BASE}/start`, {}, { headers });
      setIsTracking(true);
      setSessionStatus('active');
      setActiveTime(0);
      setIdleTime(0);
      setStartTime(res.data.session.startTime);
      lastActivityRef.current = Date.now();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start');
    }
  };

  const handleStop = async () => {
    try {
      setError('');
      await axios.post(`${API_BASE}/stop`, {}, { headers });
      setIsTracking(false);
      setSessionStatus('inactive');
      clearInterval(heartbeatRef.current);
      clearInterval(timerRef.current);
      fetchMyTime();
      if (role === 'admin') fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to stop');
    }
  };

  // =========================================
  // 🎨 RENDER
  // =========================================

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
      <div className="w-12 h-12 border-4 border-t-[#F0B90B] border-[#F2F2F2] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Time Protocol...</p>
    </div>
  );

  const totalTime = activeTime + idleTime;
  const activePercent = totalTime > 0 ? Math.round((activeTime / totalTime) * 100) : 100;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3 uppercase">
            Smart <span className="text-[#F0B90B]">Time</span> Tracker
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Activity Monitoring & Idle Detection Protocol
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="px-5 py-3 bg-[#F5F5F5] border border-[#E6E8EA] rounded-xl text-[12px] font-bold text-[#1E2026] outline-none focus:border-[#F0B90B] transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#F6465D]/10 border border-[#F6465D]/20 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={18} className="text-[#F6465D]" />
          <span className="text-[12px] font-bold text-[#F6465D]">{error}</span>
        </div>
      )}

      {/* LIVE TRACKER PANEL */}
      <div className="grid grid-cols-12 gap-8">

        {/* MAIN TIMER */}
        <div className={`col-span-12 lg:col-span-7 rounded-[32px] p-10 relative overflow-hidden shadow-2xl border transition-all duration-700 ${
          isTracking
            ? sessionStatus === 'idle'
              ? 'bg-[#F6465D]/5 border-[#F6465D]/20'
              : 'bg-[#0ECB81]/5 border-[#0ECB81]/20'
            : 'bg-[#222126] border-white/5 text-white'
        }`}>
          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full transition-all duration-1000 ${
            isTracking
              ? sessionStatus === 'idle' ? 'bg-[#F6465D]/20' : 'bg-[#0ECB81]/20'
              : 'bg-[#F0B90B]/10'
          }`}></div>

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  isTracking
                    ? sessionStatus === 'idle' ? 'bg-[#F6465D] animate-pulse' : 'bg-[#0ECB81] animate-pulse'
                    : 'bg-[#848E9C]'
                }`}></div>
                <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${
                  isTracking ? (sessionStatus === 'idle' ? 'text-[#F6465D]' : 'text-[#0ECB81]') : 'text-[#848E9C]'
                }`}>
                  {isTracking ? (sessionStatus === 'idle' ? 'Idle — Time Paused' : 'Actively Tracking') : 'Timer Inactive'}
                </span>
              </div>
              {isTracking && startTime && (
                <span className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">
                  Since {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Big Timer Display */}
            <div className="text-center mb-12">
              <h2 className={`text-7xl font-black tabular-nums tracking-tighter leading-none mb-4 ${
                isTracking ? 'text-[#1E2026]' : 'text-white'
              }`}>
                {formatTime(activeTime)}
              </h2>
              <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${
                isTracking ? 'text-[#848E9C]' : 'text-[#848E9C]'
              }`}>
                Active Working Time
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className={`p-5 rounded-2xl border ${isTracking ? 'bg-white/60 border-[#E6E8EA]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[#0ECB81]" />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isTracking ? 'text-[#848E9C]' : 'text-[#848E9C]'}`}>Active</span>
                </div>
                <p className={`text-xl font-black tabular-nums ${isTracking ? 'text-[#0ECB81]' : 'text-[#0ECB81]'}`}>{formatMinutes(activeTime)}</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isTracking ? 'bg-white/60 border-[#E6E8EA]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[#F6465D]" />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isTracking ? 'text-[#848E9C]' : 'text-[#848E9C]'}`}>Idle</span>
                </div>
                <p className={`text-xl font-black tabular-nums ${isTracking ? 'text-[#F6465D]' : 'text-[#F6465D]'}`}>{formatMinutes(idleTime)}</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isTracking ? 'bg-white/60 border-[#E6E8EA]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-[#F0B90B]" />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isTracking ? 'text-[#848E9C]' : 'text-[#848E9C]'}`}>Efficiency</span>
                </div>
                <p className={`text-xl font-black tabular-nums ${isTracking ? 'text-[#F0B90B]' : 'text-[#F0B90B]'}`}>{activePercent}%</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              {!isTracking ? (
                <button
                  onClick={handleStart}
                  className="flex-1 py-5 bg-[#0ECB81] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#0DAA6E] shadow-xl shadow-[#0ECB81]/20 active:scale-[0.98] transition-all"
                >
                  <Play size={20} fill="white" /> Start Tracking
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 py-5 bg-[#F6465D] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#D63B4F] shadow-xl shadow-[#F6465D]/20 active:scale-[0.98] transition-all"
                >
                  <Square size={18} fill="white" /> Stop Tracking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SIDE PANEL — Activity Indicators */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Activity Detection */}
          <div className="bg-white border border-[#E6E8EA] rounded-[32px] p-8">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026] mb-6 flex items-center gap-2">
              <Monitor size={16} className="text-[#F0B90B]" />
              Activity Detection
            </h3>
            <div className="space-y-4">
              {[
                { icon: MousePointer, label: 'Mouse Movement', active: isTracking && sessionStatus === 'active' },
                { icon: Keyboard, label: 'Keyboard Input', active: isTracking && sessionStatus === 'active' },
                { icon: Monitor, label: 'Tab Focus', active: isTracking },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={item.active ? 'text-[#0ECB81]' : 'text-[#848E9C]'} />
                    <span className="text-[11px] font-bold text-[#1E2026] uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-[#0ECB81] animate-pulse' : 'bg-[#E6E8EA]'}`}></div>
                </div>
              ))}
            </div>
            {isTracking && sessionStatus === 'idle' && (
              <div className="mt-4 p-4 bg-[#F6465D]/5 border border-[#F6465D]/20 rounded-xl">
                <p className="text-[10px] font-black text-[#F6465D] uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} />
                  No activity detected — Timer paused
                </p>
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="bg-[#1E2026] border border-white/5 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#F0B90B] mb-6">
                7-Day Summary
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">Total Active</span>
                  <span className="text-lg font-black tabular-nums">{formatMinutes(weeklyStats.totalActive)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">Total Idle</span>
                  <span className="text-lg font-black tabular-nums text-[#F6465D]">{formatMinutes(weeklyStats.totalIdle)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">Sessions</span>
                  <span className="text-lg font-black tabular-nums text-[#F0B90B]">{weeklyStats.sessions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S SESSIONS TABLE */}
      {todaySessions.length > 0 && (
        <div className="bg-white border border-[#E6E8EA] rounded-[32px] overflow-hidden shadow-lg">
          <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026] flex items-center gap-2">
              <Clock size={16} className="text-[#F0B90B]" />
              Today's Sessions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                  <th className="px-8 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Start</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">End</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Active</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Idle</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8EA]">
                {todaySessions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-8 py-4 text-[12px] font-bold text-[#1E2026] tabular-nums">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-8 py-4 text-[12px] font-bold text-[#1E2026] tabular-nums">{s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-8 py-4 text-[12px] font-black text-[#0ECB81] tabular-nums">{formatMinutes(s.activeTime)}</td>
                    <td className="px-8 py-4 text-[12px] font-black text-[#F6465D] tabular-nums">{formatMinutes(s.idleTime)}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        s.status === 'active' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                        s.status === 'idle' ? 'bg-[#F6465D]/10 text-[#F6465D]' :
                        'bg-[#F5F5F5] text-[#848E9C]'
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEAM / HR / ADMIN VIEW */}
      {(role === 'manager' || role === 'hr' || role === 'admin') && (
        <>
          {/* Admin Analytics Cards */}
          {role === 'admin' && adminAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Sessions', val: adminAnalytics.totalSessions, icon: BarChart3, color: 'text-[#1E2026]', bg: 'bg-[#F5F5F5]' },
                { label: 'Currently Active', val: adminAnalytics.activeSessions, icon: Activity, color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
                { label: 'Active Hours', val: formatMinutes(adminAnalytics.totalActive), icon: Zap, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
                { label: 'Active Ratio', val: `${adminAnalytics.activeRatio}%`, icon: TrendingUp, color: 'text-[#3E74FF]', bg: 'bg-[#3E74FF]/10' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-7 border border-[#E6E8EA] rounded-[24px] flex items-center gap-6 group hover:shadow-xl transition-all">
                  <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[20px] font-black text-[#1E2026] tabular-nums">{s.val}</p>
                    <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Performers (Admin) */}
          {role === 'admin' && adminAnalytics?.topPerformers?.length > 0 && (
            <div className="bg-[#1E2026] rounded-[32px] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0B90B]/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#F0B90B] mb-8 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Top Performers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminAnalytics.topPerformers.map((p, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F0B90B] text-[14px] font-black">
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-white truncate uppercase">
                          {p.employeeInfo?.profile?.firstName} {p.employeeInfo?.profile?.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">{p.role}</p>
                      </div>
                      <span className="text-[13px] font-black text-[#0ECB81] tabular-nums">{formatMinutes(p.totalActive)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Data Table */}
          <div className="bg-white border border-[#E6E8EA] rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#1E2026] flex items-center gap-3">
                {role === 'admin' ? <Shield size={18} className="text-[#F0B90B]" /> :
                 role === 'hr' ? <Eye size={18} className="text-[#F0B90B]" /> :
                 <Users size={18} className="text-[#F0B90B]" />}
                {role === 'admin' ? 'System-Wide Time Registry' :
                 role === 'hr' ? 'Organization Time Overview' :
                 'Team Time Monitoring'}
              </h3>
              <span className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest">
                {teamData.length} Records
              </span>
            </div>

            {teamData.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">No tracking data found for this date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Personnel</th>
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Active Time</th>
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Idle Time</th>
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Efficiency</th>
                      <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EA]">
                    {teamData.map((s, i) => {
                      const total = s.activeTime + s.idleTime;
                      const eff = total > 0 ? Math.round((s.activeTime / total) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] border border-[#E6E8EA] flex items-center justify-center shrink-0">
                                <User size={16} className="text-[#F0B90B]" />
                              </div>
                              <div>
                                <p className="text-[12px] font-black text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors">
                                  {s.employeeInfo?.profile?.firstName} {s.employeeInfo?.profile?.lastName}
                                </p>
                                <p className="text-[9px] font-bold text-[#848E9C] tracking-widest">{s.employeeInfo?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-lg bg-[#F5F5F5] text-[9px] font-black text-[#1E2026] uppercase tracking-widest border border-[#E6E8EA]">
                              {s.employeeRole}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-[13px] font-black text-[#0ECB81] tabular-nums">{formatMinutes(s.activeTime)}</td>
                          <td className="px-8 py-5 text-[13px] font-black text-[#F6465D] tabular-nums">{formatMinutes(s.idleTime)}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${eff >= 80 ? 'bg-[#0ECB81]' : eff >= 50 ? 'bg-[#F0B90B]' : 'bg-[#F6465D]'}`}
                                  style={{ width: `${eff}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-black tabular-nums text-[#1E2026]">{eff}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                s.status === 'active' ? 'bg-[#0ECB81] animate-pulse' :
                                s.status === 'idle' ? 'bg-[#F6465D] animate-pulse' :
                                'bg-[#848E9C]'
                              }`}></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#1E2026]">{s.status}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* FOOTER */}
      <div className="pt-8 text-center opacity-20 pb-8">
        <p className="text-[#848E9C] text-[9px] font-black uppercase tracking-[0.5em]">
          Smart Time Protocol v1.0 <br />
          <span className="text-[#F0B90B]">Idle Threshold: 5 Minutes</span>
        </p>
      </div>
    </div>
  );
};

export default SmartTimeTracker;
