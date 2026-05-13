/**
 * ============================================================
 * TIME ENGINE v2 — FRONTEND DISPLAY ONLY
 * ============================================================
 * Rules:
 *  - NO local timer increments
 *  - NO local idle calculations
 *  - NO anti-jitter / forward-only protection
 *  - ALL values come directly from backend poll
 *  - Display exactly what backend returns
 * ============================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Play, Pause, Square, Clock, Zap, TrendingUp, BarChart3,
  Calendar as CalendarIcon, Search, ArrowRight, Timer,
  ChevronLeft, ChevronRight, Activity, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = '/api/time';
const POLL_INTERVAL_MS = 1000;   // poll every second for live display
const HEARTBEAT_INTERVAL_MS = 10000; // send heartbeat every 10s

const formatTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const formatMinutes = (seconds) => `${Math.floor((seconds || 0) / 60)}m`;
const getToday = () => new Date().toISOString().split('T')[0];

const TimeTrackingDashboard = ({ user, socket }) => {
  // ── State — display only, all values from backend ──────
  const [activeTime, setActiveTime]       = useState(0);
  const [idleTime, setIdleTime]           = useState(0);
  const [inactivityCount, setInactivityCount] = useState(0);
  const [status, setStatus]               = useState(null);   // null = no session
  const [isRunning, setIsRunning]         = useState(false);
  const [isIdle, setIsIdle]               = useState(false);

  const [viewDate, setViewDate]           = useState(getToday());
  const [currentDate, setCurrentDate]     = useState(new Date());
  const [summary, setSummary]             = useState({
    stats: { active: 0, idle: 0, total: 0, productivity: 0 },
    logs: [], chartData: []
  });

  const heartbeatRef  = useRef(null);
  const pollRef       = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const getAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  // ── Apply backend values directly — NO local math ──────
  const applyServerState = useCallback((data) => {
    if (!data?.hasActiveSession) {
      setStatus(null);
      setIsRunning(false);
      setIsIdle(false);
      setActiveTime(0);
      setIdleTime(0);
      setInactivityCount(0);
      return;
    }
    setStatus(data.status);
    setIsRunning(data.isRunning);
    setIsIdle(data.status === 'idle');
    setActiveTime(data.activeTime ?? 0);
    setIdleTime(data.idleTime ?? 0);
    setInactivityCount(data.inactivityCount ?? 0);
  }, []);

  // ── Poll backend every second ───────────────────────────
  const pollStatus = useCallback(async () => {
    const auth = getAuth();
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/status`, auth);
      applyServerState(res.data);
    } catch (err) {
      console.error('[POLL ERROR]', err.message);
    }
  }, [applyServerState]);

  // ── Fetch summary (chart + logs) ────────────────────────
  const fetchSummary = useCallback(async (date = viewDate) => {
    const auth = getAuth();
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/summary?date=${date}`, auth);
      if (res.data) setSummary(res.data);
    } catch (err) {
      console.error('[SUMMARY ERROR]', err.message);
    }
  }, [viewDate]);

  // ── Send heartbeat to backend ───────────────────────────
  const sendHeartbeat = useCallback(async () => {
    const auth = getAuth();
    if (!auth || !isRunning) return;
    const sinceActivity = Date.now() - lastActivityRef.current;
    const type = sinceActivity < 60000 ? 'heartbeat' : 'idle';
    try {
      await axios.post(`${API_BASE}/activity`, { type }, auth);
    } catch (err) {
      console.error('[HEARTBEAT ERROR]', err.message);
    }
  }, [isRunning]);

  // ── Start polling + heartbeat ───────────────────────────
  useEffect(() => {
    pollStatus();
    fetchSummary();

    pollRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(heartbeatRef.current);
    };
  }, []);

  // Re-fetch summary when date changes
  useEffect(() => { fetchSummary(viewDate); }, [viewDate]);

  // Re-bind heartbeat when isRunning changes
  useEffect(() => {
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(heartbeatRef.current);
  }, [sendHeartbeat]);

  // ── Socket events ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onPaused = () => { pollStatus(); fetchSummary(); };
    const onResumed = () => { pollStatus(); fetchSummary(); };
    const onUpdate = (data) => { if (data) applyServerState(data); };
    socket.on('timer_paused', onPaused);
    socket.on('timer_resumed', onResumed);
    socket.on('timer_update', onUpdate);
    return () => {
      socket.off('timer_paused', onPaused);
      socket.off('timer_resumed', onResumed);
      socket.off('timer_update', onUpdate);
    };
  }, [socket, pollStatus, fetchSummary, applyServerState]);

  // ── Track local activity (for heartbeat type only) ─────
  useEffect(() => {
    const mark = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', mark);
    window.addEventListener('keydown', mark);
    window.addEventListener('click', mark);
    return () => {
      window.removeEventListener('mousemove', mark);
      window.removeEventListener('keydown', mark);
      window.removeEventListener('click', mark);
    };
  }, []);

  // ── Session actions ─────────────────────────────────────
  const handleAction = async (action) => {
    const auth = getAuth();
    if (!auth) return;
    try {
      await axios.post(`${API_BASE}/${action}`, {}, auth);
      // Immediately poll to get fresh state
      await pollStatus();
      await fetchSummary();
    } catch (err) {
      console.error(`[${action.toUpperCase()} ERROR]`, err.message);
    }
  };

  // ── Calendar ────────────────────────────────────────────
  const renderCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = viewDate === dateStr;
      const isToday = getToday() === dateStr;
      days.push(
        <button key={d} onClick={() => setViewDate(dateStr)}
          className={`h-8 w-8 rounded-full text-[10px] font-black transition-all border-none cursor-pointer ${
            isSelected ? 'bg-[#ff4f00] text-white shadow-lg scale-110' :
            isToday ? 'bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]' :
            'text-white/60 hover:bg-white/10'}`}>
          {d}
        </button>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const todayISO = getToday();
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const hasSession = status !== null;
  const isActive = status === 'active' && isRunning && !isIdle;

  return (
    <div className="min-h-screen bg-[#fffdf9] p-4 md:p-8 font-['Outfit'] text-[#201515]">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* Timer Card */}
          <div className="bg-white border border-[#c5c0b1] rounded-[32px] p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4f00]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#24a148] animate-pulse' : 'bg-[#c5c0b1]'}`} />
                  <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#939084] italic">Session Telemetry</h2>
                </div>

                {/* ── ACTIVE TIME — direct from backend ── */}
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums italic text-[#201515]">
                  {formatTime(activeTime)}
                </h1>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  {isIdle ? (
                    <div className="bg-[#fff4f0] border border-[#ffb38a] rounded-2xl p-4 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-[#ff4f00]" />
                          <span className="text-[11px] font-black text-[#ff4f00] uppercase tracking-widest">Inactivity Detected</span>
                        </div>
                        <span className="text-[11px] font-black bg-[#ff4f00] text-white px-2 py-0.5 rounded uppercase tracking-widest">Paused</span>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest">Idle Time</span>
                          <span className="text-[16px] font-black text-[#201515] italic">{formatTime(idleTime)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest text-[#ff4f00]">Inactivity Events</span>
                          <span className="text-[20px] font-black text-[#ff4f00] tabular-nums italic">{inactivityCount}×</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    isActive && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-[#24a148]/10 border border-[#24a148] rounded-full">
                        <Activity size={14} className="text-[#24a148]" />
                        <span className="text-[12px] font-black text-[#24a148] uppercase tracking-widest">
                          Operational Pulse Active
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Idle time sub-display */}
                {hasSession && (
                  <div className="flex gap-6 pt-2">
                    <div>
                      <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest">Idle</p>
                      <p className="text-[14px] font-black text-[#ff4f00] tabular-nums italic">{formatTime(idleTime)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest">Interruptions</p>
                      <p className="text-[14px] font-black text-[#201515] tabular-nums italic">{inactivityCount}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-row gap-4">
                {!hasSession ? (
                  <button onClick={() => handleAction('start')}
                    className="bg-[#ff4f00] text-white h-10 px-6 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer italic">
                    START <Play size={16} fill="white" />
                  </button>
                ) : (
                  <div className="flex flex-row gap-3">
                    {isActive ? (
                      <button onClick={() => handleAction('pause')}
                        className="bg-white text-[#201515] h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#eceae3] transition-all border-none cursor-pointer shadow-lg italic">
                        PAUSE <Pause size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleAction('resume')}
                        className="bg-[#24a148] text-white h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">
                        RESUME <Play size={14} fill="white" />
                      </button>
                    )}
                    <button onClick={() => handleAction('stop')}
                      className="bg-[#ff4f00] text-white h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">
                      STOP <Square size={14} fill="white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active', val: formatMinutes(summary.stats.active), icon: Zap, color: 'text-[#24a148]' },
              { label: 'Idle', val: formatMinutes(summary.stats.idle), icon: Clock, color: 'text-[#ff4f00]' },
              { label: 'Total', val: formatMinutes(summary.stats.total), icon: Timer, color: 'text-[#201515]' },
              { label: 'Yield', val: `${summary.stats.productivity}%`, icon: TrendingUp, color: 'text-[#ff4f00]' }
            ].map((card, i) => (
              <div key={i} className="bg-white border border-[#c5c0b1] p-4 rounded-[20px] shadow-sm group hover:border-[#ff4f00] transition-colors">
                <div className="flex justify-between items-start mb-4"><card.icon size={16} className={card.color} /></div>
                <h4 className="text-2xl font-black text-[#201515] tracking-tighter italic mb-1">{card.val}</h4>
                <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white border border-[#c5c0b1] rounded-[32px] p-10 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#201515] italic">Historical Pulse</h3>
              <button className="p-2 bg-[#201515] text-white rounded-lg"><BarChart3 size={16} /></button>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceae3" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#939084' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#939084' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', padding: '15px', fontWeight: 900 }} />
                  <Bar dataKey="active" fill="#ff4f00" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Calendar */}
          <div className="bg-[#201515] text-white rounded-[32px] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#ff4f00]">Calendar</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => changeMonth(-1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"><ChevronLeft size={16} /></button>
                <button onClick={() => changeMonth(1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center relative z-20">
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[8px] font-black text-white/40 mb-3">{d}</div>)}
              {renderCalendarDays()}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white border border-[#c5c0b1] rounded-[32px] p-8 shadow-sm max-h-[450px] flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#201515] mb-6">Recent Nodes</h3>
            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {summary.logs.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#fffdf9] border border-[#eceae3] rounded-2xl hover:border-[#ff4f00] transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-[16px] font-black text-[#201515] tracking-tighter italic">{formatTime(log.activeTime)}</span>
                    <span className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">{log.date}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#c5c0b1] group-hover:text-[#ff4f00] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── LOGS TABLE ── */}
      <div className="mt-12 bg-white border border-[#c5c0b1] rounded-[32px] overflow-hidden shadow-xl">
        <div className="p-8 bg-[#eceae3] border-b border-[#c5c0b1] flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#201515] italic">System Registry</h3>
            <p className="text-[9px] font-bold text-[#ff4f00] uppercase tracking-widest mt-1 italic">Filtered: {viewDate}</p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff4f00]" size={14} />
              <input type="date" value={viewDate} max={todayISO}
                onChange={(e) => setViewDate(e.target.value)}
                className="pl-10 pr-4 h-10 bg-white border border-[#c5c0b1] rounded-xl text-[11px] font-black text-[#201515] focus:outline-none focus:border-[#ff4f00] shadow-sm italic uppercase" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#939084]" size={14} />
              <input type="text" placeholder="Search..."
                className="pl-10 pr-4 h-10 bg-white border border-[#c5c0b1] rounded-xl text-[11px] font-black text-[#201515] focus:outline-none focus:border-[#ff4f00] w-48 shadow-sm italic" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                {['Node','Date','Active','Idle','Status'].map(h => (
                  <th key={h} className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.logs.map((log, i) => (
                <tr key={i} className="border-b border-[#eceae3] hover:bg-[#fffdf9] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#201515] flex items-center justify-center text-white font-black text-[10px] italic">{i + 1}</div>
                      <div>
                        <div className="text-[14px] font-black text-[#201515] italic">Pulse-{log._id?.slice(-4) || i}</div>
                        <div className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">{log.startTime ? new Date(log.startTime).toLocaleTimeString() : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[11px] font-black text-[#201515] uppercase">{log.date}</td>
                  <td className="px-8 py-6">
                    <div className="text-[14px] font-black text-[#201515] tabular-nums italic">{formatTime(log.activeTime)}</div>
                    <div className="text-[8px] font-bold text-[#24a148] uppercase tracking-widest">Active</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[14px] font-black text-[#ff4f00] tabular-nums italic">{formatTime(log.idleTime)}</div>
                    <div className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">Idle</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      log.status === 'active' ? 'bg-[#24a148]/10 text-[#24a148]' : 'bg-[#939084]/10 text-[#939084]'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
