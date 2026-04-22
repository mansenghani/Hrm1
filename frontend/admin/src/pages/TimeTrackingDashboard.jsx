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
  const todayISO = new Date().toISOString().split('T')[0];
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // State
  const [timer, setTimer] = useState(0);
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState({
    stats: { active: 0, idle: 0, total: 0, productivity: 0 },
    chartData: [],
    logs: []
  });
  const [fullLogs, setFullLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(todayISO);

  const getAuth = () => {
    const token = sessionStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  const fetchData = async (targetDate = viewDate) => {
    try {
      const auth = getAuth();
      if (!auth) { navigate('/login'); return; }
      setSyncing(true);

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
        if (isRunning && s.startTime) {
          const elapsed = Math.floor((new Date() - new Date(s.startTime)) / 1000);
          setTimer(elapsed + totalActive);
        } else { setTimer(totalActive); }
      } else { setSession(null); setTimer(0); }

      if (summaryRes.data) setSummary(summaryRes.data);
      setFullLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

    } catch (err) { console.error('Dashboard sync error:', err); }
    finally { setLoading(false); setSyncing(false); }
  };

  useEffect(() => { fetchData(todayISO); }, []);

  // Timer Engine
  useEffect(() => {
    let interval;
    if (session?.isRunning && session?.startTime) {
      interval = setInterval(() => {
        const elapsedSinceStart = Math.floor((new Date() - new Date(session.startTime)) / 1000);
        setTimer(elapsedSinceStart + (session.totalActiveTime || 0));
      }, 1000);
    } else if (session) { setTimer(session.totalActiveTime || 0); }
    return () => clearInterval(interval);
  }, [session]);

  const handleDateClick = async (dateStr) => {
    if (dateStr > todayISO) return;
    setViewDate(dateStr);
    fetchData(dateStr);
  };

  const handleAction = async (action) => {
    try {
      console.log(`--- INITIATING ${action.toUpperCase()} ---`);
      const auth = getAuth();
      if (!auth) return;
      setSyncing(true);
      const res = await axios.post(`${API_BASE}/${action}`, {}, { ...auth, timeout: 10000 });
      console.log(`${action} Success:`, res.data);
      // Wait a tiny bit for DB to catch up before refresh
      setTimeout(() => fetchData(), 500);
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
          className={`h-8 w-8 flex flex-col items-center justify-center rounded-lg text-[10px] font-black transition-all z-30 relative ${
            isFuture ? 'text-white/10 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isSelected ? 'bg-[#ff4f00] text-white shadow-lg' : (isToday ? 'border border-[#ff4f00]/40 text-white' : (isFuture ? '' : 'hover:bg-white/10'))
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
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-6">
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
          <button onClick={() => fetchData()} className="h-12 px-6 bg-[#201515] text-white rounded-[12px] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#ff4f00] transition-all shadow-lg border-none cursor-pointer">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Sync Pulse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className={`rounded-[32px] p-8 transition-all duration-700 relative overflow-hidden shadow-xl border ${session?.isRunning ? 'bg-[#fffdf9] border-[#24a148]' : 'bg-[#201515] border-transparent'}`}>
             <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
                <div className="text-center xl:text-left">
                  <div className="flex items-center gap-2 mb-4 justify-center xl:justify-start">
                     <div className={`w-2 h-2 rounded-full ${session?.isRunning ? 'bg-[#24a148] animate-pulse shadow-[0_0_8px_#24a148]' : 'bg-[#939084]'}`}></div>
                     <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${session?.isRunning ? 'text-[#201515]' : 'text-white/60'}`}>{session?.isRunning ? 'Sync Active' : 'Sync Suspended'}</span>
                  </div>
                  <h2 className={`text-[64px] md:text-[84px] font-black tabular-nums leading-none tracking-tighter italic ${session?.isRunning ? 'text-[#201515]' : 'text-white'}`}>{formatTime(timer)}</h2>
                  <p className={`text-[10px] font-black mt-4 uppercase tracking-[0.3em] italic ${session?.isRunning ? 'text-[#939084]' : 'text-white/40'}`}>Operational Yield</p>
                </div>
                <div className="flex flex-row gap-4">
                   {!session ? (
                     <button onClick={() => handleAction('start')} className="bg-[#ff4f00] text-white h-16 px-10 rounded-2xl font-black text-[15px] uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer italic">START <Play size={20} fill="white" /></button>
                   ) : (
                     <div className="flex flex-row gap-3">
                        {!session.isRunning ? (
                          <button onClick={() => handleAction('resume')} className="bg-[#24a148] text-white h-14 px-8 rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">RESUME <Play size={18} fill="white" /></button>
                        ) : (
                          <button onClick={() => handleAction('pause')} className="bg-white text-[#201515] h-14 px-8 rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#eceae3] transition-all border-none cursor-pointer shadow-lg italic">PAUSE <Pause size={18} /></button>
                        )}
                        <button onClick={() => handleAction('stop')} className="bg-[#ff4f00] text-white h-14 px-8 rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer italic">STOP <Square size={18} fill="white" /></button>
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
               <div key={i} className="bg-white border border-[#c5c0b1] p-6 rounded-[24px] shadow-sm group hover:border-[#ff4f00] transition-colors">
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
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#939084'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#939084'}} />
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
                {['S','M','T','W','T','F','S'].map(d => (<div key={d} className="text-[8px] font-black text-white/40 mb-3">{d}</div>))}
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
                      <td className="px-8 py-6 text-center"><div className="inline-flex items-center gap-2 bg-[#eceae3] px-3 py-1 rounded-lg text-[9px] font-black text-[#201515] italic">{new Date(log.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <ArrowRight size={10} /> {log.endTime ? new Date(log.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Active'}</div></td>
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
