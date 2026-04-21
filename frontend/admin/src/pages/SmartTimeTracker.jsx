import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Play, Square, Clock, Activity, Zap, Timer, TrendingUp,
  AlertTriangle, CheckCircle, MousePointer, Keyboard, Monitor,
  BarChart3, ArrowUpRight, Users, User, Shield, Eye, Search, Filter, RefreshCw, Pause
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 15000; // 15 seconds
const IDLE_THRESHOLD = 300; // 5 minutes in seconds
const API_BASE = '/api/time';

const formatTime = (seconds) => {
  const totalSecs = Math.max(0, parseInt(seconds) || 0);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatMinutes = (seconds) => {
  const totalSecs = parseInt(seconds) || 0;
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const SmartTimeTracker = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  
  const [todaySessions, setTodaySessions] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs
  const lastActivityRef = useRef(Date.now());
  const heartbeatRef = useRef(null);
  const activityTypeRef = useRef(null);

  const getAuth = () => {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      const auth = getAuth();
      if (!auth) {
        navigate('/login');
        return;
      }

      console.log('--- TRACKER RECOVERY SYNC ---');
      const [statusRes, myRes, teamRes] = await Promise.all([
        axios.get(`${API_BASE}/status`, auth).catch(() => ({ data: { hasActiveSession: false } })),
        axios.get(`${API_BASE}/my?date=${viewDate}`, auth).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/team?date=${viewDate}`, auth).catch(() => ({ data: [] }))
      ]);
      
      if (statusRes.data && statusRes.data.hasActiveSession) {
        const s = statusRes.data;
        const isRunning = s.isRunning !== undefined ? s.isRunning : (s.status === 'active');
        const totalActive = s.totalActiveTime || s.activeTime || 0;
        
        setSession({ ...s, isRunning, totalActiveTime: totalActive });
        setIdleTime(s.idleTime || 0);

        if (isRunning && s.startTime) {
            const elapsed = Math.floor((new Date() - new Date(s.startTime)) / 1000);
            setTimer(elapsed + totalActive);
        } else {
            setTimer(totalActive);
        }
      } else {
        setSession(null);
        setTimer(0);
        setIdleTime(0);
      }

      setTodaySessions(Array.isArray(myRes.data) ? myRes.data : []);
      setTeamData(Array.isArray(teamRes.data) ? teamRes.data : []);

    } catch (err) { 
      console.error('Data pull disrupted:', err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewDate]);

  // 🛡️ HARDENED TIMER ENGINE
  useEffect(() => {
    let interval;
    if (session && session.isRunning && session.startTime) {
        interval = setInterval(() => {
            const now = new Date();
            const start = new Date(session.startTime);
            const elapsedSinceStart = Math.floor((now - start) / 1000);
            setTimer(elapsedSinceStart + (session.totalActiveTime || 0));
        }, 1000);
    } else if (session) {
        setTimer(session.totalActiveTime || 0);
    } else {
        setTimer(0);
    }
    return () => clearInterval(interval);
  }, [session]);

  const handleAction = async (action) => {
    try {
      const auth = getAuth();
      if (!auth) {
        navigate('/login');
        return;
      }
      const config = { ...auth, timeout: 5000 };
      await axios.post(`${API_BASE}/${action}`, {}, config);
      fetchData();
    } catch (err) { 
      const msg = err.response?.data?.message || err.message || 'Action Interrupted';
      alert(`Tracker Error: ${msg}`);
    }
  };

  // Activity Tracking
  const handleUserActivity = useCallback((type) => {
    if (session?.status === 'paused') return;
    lastActivityRef.current = Date.now();
    activityTypeRef.current = type;
  }, [session]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'focus', 'click', 'scroll'];
    const handler = (e) => handleUserActivity(e.type);
    if (session?.isRunning) {
      events.forEach(e => window.addEventListener(e, handler));
    }
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [session?.isRunning, handleUserActivity]);

  useEffect(() => {
    if (session?.isRunning) {
      heartbeatRef.current = setInterval(async () => {
        try {
          const auth = getAuth();
          if (!auth) return;
          const sinceLast = Math.floor((Date.now() - lastActivityRef.current) / 1000);
          const type = sinceLast >= IDLE_THRESHOLD ? 'idle' : (activityTypeRef.current || 'active');
          await axios.post(`${API_BASE}/activity`, { type }, auth);
          activityTypeRef.current = null;
        } catch (err) { console.error('Heartbeat failure'); }
      }, HEARTBEAT_INTERVAL);
    } else {
      clearInterval(heartbeatRef.current);
    }
    return () => clearInterval(heartbeatRef.current);
  }, [session?.isRunning]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <RefreshCw size={32} className="text-[#ff4f00] animate-spin" />
      <p className="zap-caption-upper text-[#939084]">Initializing Time Protocol...</p>
    </div>
  );

  const activePercent = (timer + idleTime) > 0 ? Math.round((timer / (timer + idleTime)) * 100) : 100;

  return (
    <div className="animate-fade-in pb-32 max-w-[1400px] mx-auto px-6">
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Activity Monitoring Protocol</p>
          <h1 className="zap-display-hero">Smart <span className="text-[#ff4f00]">Time Tracker.</span></h1>
        </div>
        <div className="flex flex-wrap items-center gap-6 mt-6 md:mt-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" size={18} />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 h-12 bg-white border border-[#c5c0b1] rounded-[4px] text-[14px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={fetchData}
            className="h-12 px-6 bg-[#201515] text-[#fffefb] rounded-[4px] text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#ff4f00] transition-all shadow-lg cursor-pointer border-none"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync Registry
          </button>
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="h-12 px-5 bg-white border border-[#c5c0b1] rounded-[4px] text-[14px] font-bold text-[#201515] outline-none shadow-sm"
          />
        </div>
      </div>

      {/* TRACKER PANEL */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className={`col-span-12 lg:col-span-8 zap-card p-10 transition-all duration-700 relative overflow-hidden shadow-xl ${
          session?.isRunning ? (session.status === 'idle' ? 'bg-[#fffdf9] border-[#ff4f00]' : 'bg-[#fffdf9] border-[#24a148]') : 'bg-[#201515] text-[#fffefb]'
        }`}>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${session?.isRunning ? (session.status === 'idle' ? 'bg-[#ff4f00] animate-pulse' : 'bg-[#24a148] animate-pulse') : 'bg-[#939084]'}`}></div>
                <span className={`zap-caption-upper !text-[11px] font-black tracking-widest ${!session?.isRunning ? 'text-white' : 'text-[#201515]'}`}>
                  {session?.isRunning ? (session.status === 'idle' ? 'Idle — Sync Paused' : 'Actively Monitoring') : (session?.status === 'paused' ? 'Session Paused' : 'Timer Disconnected')}
                </span>
              </div>
              {session && session.startTime && (
                <span className={`text-[11px] font-black uppercase tracking-widest ${!session?.isRunning ? 'text-white/60' : 'text-[#939084]'}`}>
                  Sync: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div className="text-center mb-12">
              <h2 className={`text-[80px] font-black tabular-nums tracking-tighter leading-none mb-4 italic ${!session?.isRunning ? 'text-white' : 'text-[#201515]'}`}>
                {formatTime(timer)}
              </h2>
              <p className={`text-[11px] font-black uppercase tracking-widest ${!session?.isRunning ? 'text-white/60' : 'text-[#939084]'}`}>Active Workspace Participation</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <p className="text-[10px] font-black text-[#939084] uppercase tracking-widest mb-2">Active</p>
                <p className="text-[20px] font-black text-[#24a148] tracking-tighter">{formatMinutes(timer)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <p className="text-[10px] font-black text-[#939084] uppercase tracking-widest mb-2">Idle</p>
                <p className="text-[20px] font-black text-[#ff4f00] tracking-tighter">{formatMinutes(idleTime)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <p className="text-[10px] font-black text-[#939084] uppercase tracking-widest mb-2">Yield</p>
                <p className="text-[20px] font-black text-white tracking-tighter">{activePercent}%</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {!session ? (
                <button 
                  onClick={() => handleAction('start')} 
                  className="bg-[#ff4f00] text-white h-16 flex-1 rounded-xl font-black text-[16px] uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none"
                >
                  <Play size={20} fill="white" /> START
                </button>
              ) : (
                <>
                  {!session.isRunning ? (
                    <button 
                      onClick={() => handleAction('resume')} 
                      className="bg-[#24a148] text-white h-16 flex-1 rounded-xl font-black text-[16px] uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none"
                    >
                      <Play size={20} fill="white" /> RESUME
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction('pause')} 
                      className="bg-[#fffefb] text-[#201515] h-16 flex-1 rounded-xl font-black text-[16px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#eceae3] transition-all cursor-pointer border-none"
                    >
                      <Pause size={20} /> PAUSE
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction('stop')} 
                    className="bg-[#ff4f00] text-white h-16 flex-1 rounded-xl font-black text-[16px] uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none"
                  >
                    <Square size={20} fill="white" /> STOP
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SIDE ACTIVITY */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#fffdf9] border border-[#c5c0b1] p-8 rounded-3xl">
              <h3 className="text-[12px] font-black text-[#201515] uppercase tracking-widest mb-8 flex items-center gap-3 italic">
                 <Monitor size={18} />
                 Node Sensor Stream
              </h3>
              <div className="space-y-4">
                 {[
                   { icon: MousePointer, label: 'Mouse Movement', active: session?.isRunning && session.status === 'active' },
                   { icon: Keyboard, label: 'Keyboard Input', active: session?.isRunning && session.status === 'active' },
                   { icon: Monitor, label: 'Tab Focus', active: session?.isRunning },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#c5c0b1] rounded-xl">
                      <div className="flex items-center gap-4 text-[#201515]">
                         <item.icon size={16} />
                         <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-[#24a148] animate-pulse' : 'bg-[#c5c0b1]'}`}></div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#201515] p-8 rounded-3xl text-white shadow-2xl">
              <h3 className="text-[12px] font-black text-[#ff4f00] uppercase tracking-widest mb-8 italic">Historical Pulse</h3>
              <div className="space-y-4">
                {todaySessions.length === 0 ? (
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">No previous segments</p>
                ) : (
                    todaySessions.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Segment {todaySessions.length - i}</span>
                            <span className="text-[16px] font-black text-[#ff4f00]">{formatTime(s.activeTime)}</span>
                        </div>
                    ))
                )}
              </div>
           </div>
        </div>
      </div>

      {/* TEAM TABLE */}
      {teamData.length > 0 && (
        <div className="bg-white border border-[#c5c0b1] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 bg-[#eceae3] border-b border-[#c5c0b1] flex justify-between items-center">
             <h3 className="text-[12px] font-black uppercase tracking-widest text-[#201515]">Personnel Time Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                  <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-widest">Personnel</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-widest">Active Yield</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c0b1]">
                {teamData.map((s, i) => (
                  <tr key={i} className="hover:bg-[#fffdf9] transition-colors group">
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#eceae3] flex items-center justify-center text-[#201515] font-black">
                              {s.employeeRole?.charAt(0) || 'U'}
                          </div>
                          <div>
                              <p className="text-[14px] font-black text-[#201515] uppercase tracking-tight">
                                {s.employeeRole || 'Unknown Node'}
                              </p>
                              <p className="text-[9px] font-black text-[#939084] uppercase">Node ID: {String(s.employeeId || '').slice(-6)}</p>
                          </div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-[18px] font-black text-[#24a148] tabular-nums tracking-tighter">{formatTime(s.activeTime)}</td>
                    <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.isRunning ? 'bg-[#24a148] animate-pulse' : 'bg-[#c5c0b1]'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#201515]">{s.status}</span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTimeTracker;
