import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Play, Square, Clock, Activity, Zap, Timer, TrendingUp,
  AlertTriangle, CheckCircle, MousePointer, Keyboard, Monitor,
  BarChart3, ArrowUpRight, Users, User, Shield, Eye, Search,
  Filter, RefreshCw, Pause, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  List, PieChart, MoreVertical, Download, ExternalLink, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

const API_BASE = '/api/time';
const STATUS_POLL_INTERVAL = 3000; // 3 seconds for near-instant parity

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

const TimeTrackingDashboard = () => {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem('role') || 'employee';
  const getLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayISO = getLocalDate(new Date());
  const yesterdayISO = getLocalDate(Date.now() - 86400000);

  // State
  const [timer, setTimer] = useState(0);
  const [session, setSession] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isIdle, setIsIdle] = useState(false);
  const [autoIdle, setAutoIdle] = useState(false);
  const [summary, setSummary] = useState({
    stats: { active: 0, idle: 0, total: 0, productivity: 0 },
    chartData: [],
    logs: []
  });
  const [fullLogs, setFullLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const activityTypeRef = useRef('heartbeat');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(todayISO);

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 Minutes
  const idleTimerRef = useRef(null);
  const audioRef = useRef(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const triggerIdle = useCallback(async () => {
    if (isIdle) return;
    setIsIdle(true);
    setAutoIdle(true);
    activityTypeRef.current = 'idle';
    clearIdleTimer();
    await syncActivity('idle');
  }, [isIdle, clearIdleTimer]);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (!session?.isRunning || isIdle) return;
    idleTimerRef.current = window.setTimeout(() => {
      if (!isIdle && session?.isRunning) {
        triggerIdle();
      }
    }, INACTIVITY_TIMEOUT);
  }, [clearIdleTimer, isIdle, session?.isRunning, triggerIdle]);

  useEffect(() => {
    if (session?.isRunning && !isIdle) {
      resetIdleTimer();
    } else {
      clearIdleTimer();
    }
    return () => clearIdleTimer();
  }, [session?.isRunning, isIdle, resetIdleTimer, clearIdleTimer]);

  // No browser notification needed here; desktop app will show idle alerts instead.
  useEffect(() => {
    // intentionally no web notification permission request
  }, []);

  const getAuth = () => {
    const token = sessionStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  const fetchData = async (targetDate = viewDate) => {
    try {
      const auth = getAuth();
      if (!auth) { navigate('/login'); return; }
      setSyncing(true);

      // Check if day shifted (Midnight Reset)
      const currentToday = new Date().toISOString().split('T')[0];
      if (currentToday !== todayISO) {
        window.location.reload(); // Force full system reset for new day
        return;
      }

      const [statusRes, summaryRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE}/status`, auth).catch(() => ({ data: { hasActiveSession: false } })),
        axios.get(`${API_BASE}/summary`, auth).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/date/${targetDate}`, auth).catch(() => ({ data: [] }))
      ]);

      if (statusRes.data?.hasActiveSession) {
        const s = statusRes.data;
        const isRunning = s.isRunning !== undefined ? s.isRunning : (s.status === 'active');
        const totalActive = s.totalActiveTime || s.activeTime || 0;

        setSession({ ...s, isRunning, totalActiveTime: totalActive });
        setIsIdle(s.status === 'idle');
        setAutoIdle(s.status === 'idle');

        if (isRunning) {
          let calculatedTimer = totalActive;
          if (s.startTime) {
            const elapsed = Math.floor((new Date() - new Date(s.startTime)) / 1000);
            calculatedTimer = Math.max(0, elapsed + totalActive);
          }

          setTimer(prev => {
            // 🛡️ SOFT SYNC: Only jump if difference > 1s (tighter sync)
            if (Math.abs(prev - calculatedTimer) > 1 || prev === 0) {
              return calculatedTimer;
            }
            return prev;
          });
        } else {
          setTimer(totalActive);
        }
      } else {
        setSession(null);
        setTimer(0);
        setIsIdle(false);
      }

      if (summaryRes.data) {
        const s = summaryRes.data;
        // Ensure idle time from status endpoint takes priority for the high-density box
        if (statusRes.data?.hasActiveSession) {
          s.stats.idle = statusRes.data.idleTime || s.stats.idle || 0;
        }
        setSummary(s);
      }
      setFullLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

    } catch (err) { console.error('Dashboard sync error:', err); }
    finally { setLoading(false); setSyncing(false); }
  };

  // 🔄 ACTIVITY TRACKER
  useEffect(() => {
    if (!session?.hasActiveSession || session?.status === 'paused' || session?.status === 'idle') return;

    const normalizeActivityType = (eventType) => {
      switch (eventType) {
        case 'keydown': return 'keyboard';
        case 'mousemove':
        case 'mousedown': return 'mouse';
        case 'click': return 'click';
        case 'scroll': return 'scroll';
        case 'focus': return 'focus';
        case 'touchstart': return 'touch';
        default: return 'active';
      }
    };

    const handleActivity = (event) => {
      const now = Date.now();
      setLastActivity(now);
      const activityType = normalizeActivityType(event?.type);
      activityTypeRef.current = activityType;
      resetIdleTimer();

      if (isIdle && autoIdle) {
        console.log('[TERMINAL] ACTIVITY DETECTED WHILE AUTO-IDLE; MANUAL RESUME REQUIRED');
        return;
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('focus', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // 🖥️ SYSTEM-LEVEL IDLE DETECTION (Chrome/Edge)
    let controller;
    const startSystemIdleDetection = async () => {
      if ('IdleDetector' in window) {
        try {
          const status = await IdleDetector.requestPermission();
          if (status === 'granted') {
            controller = new AbortController();
            const detector = new IdleDetector();
            detector.addEventListener('change', () => {
              const { userState, screenState } = detector;
              console.log(`[SYSTEM] State changed: ${userState}, ${screenState}`);
              if (userState === 'active') {
                handleActivity();
              } else {
                // System went idle (even outside browser)
                triggerIdle();
              }
            });
            await detector.start({
              threshold: INACTIVITY_TIMEOUT / 1000,
              signal: controller.signal,
            });
            console.log('[SYSTEM] Idle Detection Active');
          }
        } catch (err) { console.error('IdleDetector Error:', err); }
      }
    };
    startSystemIdleDetection();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (controller) controller.abort();
    };
  }, [session, isIdle, autoIdle]);

  // 💓 HEARTBEAT SYNC
  useEffect(() => {
    if (!session?.isRunning || isIdle) return;

    const interval = setInterval(() => {
      // Midnight Reset Check
      const now = new Date().toISOString().split('T')[0];
      if (now !== todayISO) {
        console.log('[SYSTEM] MIDNIGHT DETECTED - RELOADING...');
        window.location.reload();
        return;
      }
      syncActivity(activityTypeRef.current || 'heartbeat');
      activityTypeRef.current = 'heartbeat';
    }, 30000); // 30s heartbeat

    return () => clearInterval(interval);
  }, [session, isIdle, todayISO]);

  const syncActivity = async (type) => {
    try {
      const auth = getAuth();
      if (!auth) return;
      const res = await axios.post(`${API_BASE}/activity`, { type }, auth);
      if (type === 'heartbeat' && activityTypeRef.current !== 'heartbeat') {
        activityTypeRef.current = 'heartbeat';
      }

      if (res.data) {
        if (res.data.status === 'reload') {
          window.location.reload();
          return;
        }
        setSession(prev => ({
          ...prev,
          status: res.data.status,
          isRunning: res.data.isRunning,
          totalActiveTime: res.data.activeTime
        }));

        // If we just resumed or heartbeated, sync the main timer to the truth from the server
        if (type === 'resume' || type === 'heartbeat') {
          setTimer(res.data.activeTime);
        }
      }
    } catch (err) { console.error('Activity sync failed:', err); }
  };

  useEffect(() => { fetchData(todayISO); }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchData(viewDate), STATUS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [viewDate]);

  // Timer Engine
  useEffect(() => {
    if (!session?.isRunning) return;

    const interval = setInterval(() => {
      if (isIdle) {
        // Increment idle stat locally for real-time display
        setSummary(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            idle: (prev.stats.idle || 0) + 1,
            total: (prev.stats.total || 0) + 1
          }
        }));
      } else {
        setTimer(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.isRunning, isIdle]);

  const handleDateClick = async (dateStr) => {
    if (dateStr > todayISO) return;
    setViewDate(dateStr);
    fetchData(dateStr);
  };

  const handleAction = async (action) => {
    if (['pause', 'stop', 'resume'].includes(action)) {
      setAutoIdle(false);
      if (action !== 'pause') setIsIdle(false);
    }

    try {
      const auth = getAuth();
      if (!auth) return;
      setSyncing(true);
      const res = await axios.post(`${API_BASE}/${action}`, {}, { ...auth, timeout: 10000 });

      if (action === 'resume' && res.data?.session) {
        const s = res.data.session;
        const isRunning = s.isRunning !== undefined ? s.isRunning : (s.status === 'active');
        const totalActive = s.totalActiveTime || s.activeTime || 0;
        const timerValue = isRunning && s.startTime ? Math.floor((new Date() - new Date(s.startTime)) / 1000) + totalActive : totalActive;
        setSession({ ...s, isRunning, totalActiveTime: totalActive });
        setTimer(timerValue);
      }

      await fetchData();
    } catch (err) {
      console.error(`${action} Error:`, err);
      alert(`Terminal Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Calendar Helpers
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    if (newDate > maxDate) return;
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const HOLIDAYS = {
    '2026-01-01': 'New Year',
    '2026-01-26': 'Republic Day',
    '2026-03-25': 'Holi',
    '2026-04-10': 'Good Friday',
    '2026-04-14': 'Ambedkar Jayanti',
    '2026-05-01': 'Labour Day',
    '2026-08-15': 'Independence Day',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-12-25': 'Christmas'
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 opacity-0"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const isSelected = viewDate === dateStr;
      const isFuture = dateStr > todayISO;
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      const holidayName = HOLIDAYS[dateStr];

      days.push(
        <div
          key={i}
          onClick={() => !isFuture && handleDateClick(dateStr)}
          title={holidayName || ''}
          className={`h-8 w-8 flex flex-col items-center justify-center rounded-lg text-[10px] font-black transition-all z-30 relative ${isFuture ? 'text-white/10 cursor-not-allowed' : 'cursor-pointer'
            } ${isSelected ? 'bg-[#ff4f00] text-white shadow-lg' : (isToday ? 'border border-[#ff4f00]/40 text-white' : (isFuture ? '' : 'hover:bg-white/10'))
            }`}
        >
          <span>{i}</span>
          {holidayName && (
            <div className="absolute bottom-1 w-1 h-1 bg-[#ff4f00] rounded-full shadow-[0_0_5px_#ff4f00]"></div>
          )}
        </div>
      );
    }
    return days;
  };

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
      <RefreshCw size={32} className="text-[#ff4f00] animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#939084]">Initializing Terminal...</p>
    </div>
  );

  return (
    <div className="animate-fade-in pb-20 max-w-[1400px] mx-auto px-6">

      {/* 🏁 HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity size={14} className="text-[#ff4f00]" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff4f00]">Operational Pulse V5.0</p>
          </div>
          <h1 className="text-[42px] font-black text-[#201515] tracking-tighter leading-none italic uppercase">
            Time <span className="text-[#ff4f00]">Registry.</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <button onClick={() => fetchData()} className="h-10 px-5 bg-[#201515] text-white rounded-[10px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#ff4f00] transition-all shadow-lg border-none cursor-pointer">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Sync Pulse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className={`rounded-[24px] p-4 transition-all duration-700 relative overflow-hidden shadow-xl border ${session?.isRunning ? 'bg-[#fffdf9] border-[#24a148]' : 'bg-[#201515] border-transparent'}`}>
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
              <div className="text-center xl:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center xl:justify-start">
                  <div className={`w-2 h-2 rounded-full ${isIdle ? 'bg-[#ff4f00] animate-pulse shadow-[0_0_8px_#ff4f00]' : (session?.isRunning ? 'bg-[#24a148] animate-pulse shadow-[0_0_8px_#24a148]' : 'bg-[#939084]')}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${isIdle ? 'text-[#ff4f00]' : (session?.isRunning ? 'text-[#201515]' : 'text-white/60')}`}>
                    {isIdle ? 'Inactivity Detected' : (session?.isRunning ? 'Sync Active' : 'Sync Suspended')}
                  </span>
                </div>
                <h2 className={`text-[44px] md:text-[54px] font-black tabular-nums leading-none tracking-tighter italic ${isIdle ? 'text-[#ff4f00]' : (session?.isRunning ? 'text-[#201515]' : 'text-white/60')}`}>
                  {formatTime(timer)}
                </h2>
                <div className="flex flex-col items-start gap-2 mt-4">
                  {isIdle ? (
                    <div className="flex flex-col gap-2 p-4 bg-[#ff4f00]/5 border border-[#ff4f00]/30 rounded-2xl w-full max-w-[400px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#ff4f00] animate-ping"></div>
                          <span className="text-[11px] font-black text-[#ff4f00] uppercase tracking-widest">Inactivity Detected</span>
                        </div>
                        <span className="text-[11px] font-black text-[#ff4f00] uppercase tracking-widest bg-[#ff4f00] text-white px-2 py-0.5 rounded">Deducting</span>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest">Activity Ceased at</span>
                          <span className="text-[16px] font-black text-[#201515] italic">{new Date(lastActivity).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest">Duration</span>
                          <span className="text-[20px] font-black text-[#ff4f00] tabular-nums italic">-{formatTime(Math.floor((Date.now() - lastActivity) / 1000))}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    session?.isRunning && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-[#24a148]/10 border border-[#24a148] rounded-full">
                        <Activity size={14} className="text-[#24a148]" />
                        <span className="text-[12px] font-black text-[#24a148] uppercase tracking-widest">
                          Operational Pulse Active (Tracking Work)
                        </span>
                      </div>
                    )
                  )}
                </div>
                {session?.isRunning && (
                  <div className="mt-4 p-3 bg-[#fdf2f2] border border-[#fbd5d5] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#ff4f00]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#201515]">Total Inactivity Today</span>
                    </div>
                    <span className="text-[16px] font-black text-[#ff4f00] tabular-nums italic">{formatTime(summary.stats.idle)}</span>
                  </div>
                )}
                <p className={`text-[10px] font-black mt-4 uppercase tracking-[0.3em] italic ${session?.isRunning && !isIdle ? 'text-[#939084]' : 'text-white/40'}`}>Operational Yield</p>
              </div>
              <div className="flex flex-row gap-4">
                {!session ? (
                  <button onClick={() => handleAction('start')} className="bg-[#ff4f00] text-white h-10 px-6 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer italic">START <Play size={16} fill="white" /></button>
                ) : (
                  <div className="flex flex-row gap-3">
                    {!session.isRunning ? (
                      <button onClick={() => handleAction('resume')} className="bg-[#24a148] text-white h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">RESUME <Play size={14} fill="white" /></button>
                    ) : (
                      <button onClick={() => handleAction('pause')} className="bg-white text-[#201515] h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#eceae3] transition-all border-none cursor-pointer shadow-lg italic">PAUSE <Pause size={14} /></button>
                    )}
                    <button onClick={() => handleAction('stop')} className="bg-[#ff4f00] text-white h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">STOP <Square size={14} fill="white" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

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

          <div className="bg-white border border-[#c5c0b1] rounded-[32px] p-10 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div><h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#201515] italic">Historical Pulse</h3></div>
              <div className="flex gap-2"><button className="p-2 bg-[#201515] text-white rounded-lg"><BarChart3 size={16} /></button></div>
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

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-[#201515] text-white rounded-[32px] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#ff4f00]">Calendar</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => changeMonth(-1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"><ChevronLeft size={16} /></button>
                <button onClick={() => changeMonth(1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center relative z-20">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (<div key={d} className="text-[8px] font-black text-white/40 mb-3">{d}</div>))}
              {renderCalendarDays()}
            </div>
          </div>

          <div className="bg-white border border-[#c5c0b1] rounded-[32px] p-8 shadow-sm max-h-[450px] flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#201515] mb-6">Recent Nodes</h3>
            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {summary.logs.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#fffdf9] border border-[#eceae3] rounded-2xl hover:border-[#ff4f00] transition-colors group">
                  <div className="flex flex-col"><span className="text-[16px] font-black text-[#201515] tracking-tighter italic">{formatTime(log.activeTime)}</span><span className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">{log.date}</span></div>
                  <ArrowRight size={14} className="text-[#c5c0b1] group-hover:text-[#ff4f00] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white border border-[#c5c0b1] rounded-[32px] overflow-hidden shadow-xl">
        <div className="p-8 bg-[#eceae3] border-b border-[#c5c0b1] flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#201515] italic">System Registry</h3>
            <p className="text-[9px] font-bold text-[#ff4f00] uppercase tracking-widest mt-1 italic">Filtered: {viewDate}</p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <button
              onClick={() => handleDateClick(yesterdayISO)}
              className="hidden h-10 px-4 bg-[#201515] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff4f00] transition-colors border-none cursor-pointer italic"
            >
              Yesterday
            </button>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff4f00]" size={14} />
              <input type="date" value={viewDate} max={todayISO} onChange={(e) => handleDateClick(e.target.value)} className="pl-10 pr-4 h-10 bg-white border border-[#c5c0b1] rounded-xl text-[11px] font-black text-[#201515] focus:outline-none focus:border-[#ff4f00] shadow-sm italic uppercase" />
            </div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#939084]" size={14} /><input type="text" placeholder="Search..." className="pl-10 pr-4 h-10 bg-white border border-[#c5c0b1] rounded-xl text-[11px] font-black text-[#201515] focus:outline-none focus:border-[#ff4f00] w-48 shadow-sm italic" /></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-[#fffdf9] border-b border-[#c5c0b1]"><th className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em]">Node</th><th className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em] text-center">Date</th><th className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em] text-center">Interval</th><th className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em] text-center">Yield</th><th className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em] text-right">Status</th></tr></thead>
            <tbody className="divide-y divide-[#eceae3]">
              {fullLogs.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="opacity-30 italic"><Search size={32} className="mx-auto mb-4" /><p className="text-[11px] font-black uppercase tracking-widest">No node telemetry found for {viewDate}</p></div></td></tr>
              ) : (
                [...fullLogs].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 20).map((log, i) => (
                  <tr key={i} className="hover:bg-[#fffdf9] transition-colors group">
                    <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-[#201515] flex items-center justify-center text-white font-black text-lg group-hover:bg-[#ff4f00] transition-colors italic">{(log.employeeId?.fullName || log.employeeRole || 'U').charAt(0)}</div><span className="text-[13px] font-black text-[#201515] uppercase italic">{log.employeeId?.fullName || 'Node'}</span></div></td>
                    <td className="px-8 py-6 text-[12px] font-black text-[#201515] text-center uppercase italic">{log.date}</td>
                    <td className="px-8 py-6 text-center"><div className="inline-flex items-center gap-2 bg-[#eceae3] px-3 py-1 rounded-lg text-[9px] font-black text-[#201515] italic">{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <ArrowRight size={10} /> {log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</div></td>
                    <td className="px-8 py-6 text-[20px] font-black text-[#24a148] tabular-nums tracking-tighter italic text-center">{formatTime(log.activeTime)}</td>
                    <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2"><div className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-[#939084]' : 'bg-[#24a148] animate-pulse'}`}></div><span className="text-[10px] font-black uppercase tracking-widest text-[#201515] italic">{log.status}</span></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
