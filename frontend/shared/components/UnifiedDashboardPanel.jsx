import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Clock, Zap, Activity, Users, Search,
  BarChart3, RefreshCw, Calendar as CalendarIcon,
  ChevronRight, AlertTriangle, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Reusable Components
const StatsCard = ({ title, value, icon: Icon, colorClass, isDark }) => (
  <div className={`border p-6 rounded-[5px] shadow-sm flex flex-col justify-between group transition-all ${
    isDark 
      ? 'bg-[#0f0d0a] border-[#38352e] hover:border-white' 
      : 'bg-white border-[#E6E8EA] hover:border-[#00a76b]'
  }`}>
    <div className="flex justify-between items-center mb-4">
      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>{title}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isDark ? 'bg-[#282520]' : 'bg-gray-50'
      } ${colorClass}`}>
        <Icon size={16} />
      </div>
    </div>
    <div className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#1E2026]'}`}>
      {value}
    </div>
  </div>
);

const StatusBadge = ({ status, isDark }) => {
  const statusColors = isDark ? {
    active: 'bg-green-950/30 text-green-400 border border-green-500/25',
    idle: 'bg-emerald-950/30 text-orange-400 border border-emerald-500/25',
    paused: 'bg-slate-900 text-slate-400 border border-slate-700/25',
    completed: 'bg-blue-950/30 text-blue-400 border border-blue-500/25'
  } : {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-orange-100 text-orange-700',
    paused: 'bg-gray-100 text-gray-700',
    completed: 'bg-blue-100 text-blue-700'
  };
  const color = statusColors[status?.toLowerCase()] || (isDark ? 'bg-slate-900 text-slate-400 border border-slate-700/25' : 'bg-gray-100 text-gray-700');

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
      {status || 'Unknown'}
    </span>
  );
};

const DataTable = ({ data, isDark }) => (
  <div className="overflow-x-auto w-full">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className={`border-b ${isDark ? 'bg-[#181612] border-[#38352e]' : 'bg-[#F5F7FA] border-[#E6E8EA]'}`}>
          <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>Name</th>
          <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>Role</th>
          <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>Today Hours</th>
          <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>Status</th>
          <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>Last Activity</th>
        </tr>
      </thead>
      <tbody className={`divide-y ${isDark ? 'divide-[#38352e]' : 'divide-[#E6E8EA]'}`}>
        {data.length === 0 ? (
          <tr>
            <td colSpan="5" className={`py-12 text-center font-black text-[12px] uppercase tracking-widest ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#181612]' : 'hover:bg-gray-50'}`}>
              <td className={`px-6 py-4 text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#1E2026]'}`}>{row.name}</td>
              <td className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>{row.role}</td>
              <td className={`px-6 py-4 text-[14px] font-black text-center tabular-nums ${isDark ? 'text-white' : 'text-[#1E2026]'}`}>
                {Math.floor(row.todayHours / 3600)}h {Math.floor((row.todayHours % 3600) / 60)}m
              </td>
              <td className="px-6 py-4 text-center"><StatusBadge status={row.status} isDark={isDark} /></td>
              <td className={`px-6 py-4 text-[11px] font-bold text-right ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>
                {new Date(row.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const UnifiedDashboardPanel = () => {
  const [data, setData] = useState({
    stats: { totalTime: 0, activeTime: 0, idleTime: 0, sessions: 0 },
    chartData: [],
    tableData: [],
    activityLogs: []
  });
  const [filters, setFilters] = useState({
    timeRange: 'today',
    userFilter: '',
    roleFilter: ''
  });
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null); // 'time' or 'role'
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Sync theme status reactively
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const timeRef = useRef(null);
  const roleRef = useRef(null);
  const userRole = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');

  // 🛡️ CLOSE DROPDOWN ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeRef.current && !timeRef.current.contains(event.target) &&
          roleRef.current && !roleRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/time/dashboard?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch unified dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const formatHrs = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className={`w-full rounded-[5px] shadow-xl border overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#E6E8EA]'
    }`}>
      {/* HEADER & FILTERS */}
      <div className={`p-10 border-b flex flex-col lg:flex-row justify-between gap-6 transition-colors ${
        isDark ? 'border-[#38352e] bg-[#181612]' : 'border-[#E6E8EA] bg-[#F8FAFC]'
      }`}>
        <div>
          <h2 className={`text-[18px] font-black uppercase tracking-[0.2em] transition-colors ${
            isDark ? 'text-white' : 'text-[#1E2026]'
          }`}>Operational Overview</h2>
          <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${
            isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'
          }`}>Unified Performance Metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* TIME RANGE DROPDOWN */}
          <div className="relative" ref={timeRef}>
            <button 
              onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
              className={`px-4 py-2.5 border rounded-[5px] text-[10px] font-black uppercase tracking-widest outline-none flex items-center gap-4 cursor-pointer transition-all min-w-[140px] justify-between shadow-sm ${
                isDark 
                  ? 'bg-[#181612] border-[#38352e] text-white hover:border-[#00a76b]' 
                  : 'bg-white border-[#eceae3] text-[#201515] hover:border-[#00a76b]'
              }`}
            >
              {filters.timeRange === 'today' ? 'Today' : filters.timeRange === 'weekly' ? 'This Week' : 'This Month'}
              <ChevronDown size={14} className={`transition-transform ${openDropdown === 'time' ? 'rotate-180 text-[#00a76b]' : 'rotate-0 text-[#939084]'}`} />
            </button>
            {openDropdown === 'time' && (
              <div className={`absolute top-[calc(100%+8px)] left-0 w-full border rounded-[5px] shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#eceae3]'
              }`}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'weekly', label: 'This Week' },
                  { id: 'monthly', label: 'This Month' }
                ].map((opt) => (
                  <div key={opt.id} onClick={() => { setFilters(f => ({ ...f, timeRange: opt.id })); setOpenDropdown(null); }}
                    className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors border-b last:border-none ${
                      isDark 
                        ? 'text-white hover:bg-[#00a76b]/10 hover:text-[#00a76b] border-[#38352e]' 
                        : 'text-[#201515] hover:bg-[#00a76b]/5 hover:text-[#00a76b] border-[#f8f8f8]'
                    }`}>
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(userRole === 'admin' || userRole === 'hr' || userRole === 'manager') && (
            <>
              {/* ROLE FILTER DROPDOWN */}
              <div className="relative" ref={roleRef}>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
                  className={`px-4 py-2.5 border rounded-[5px] text-[10px] font-black uppercase tracking-widest outline-none flex items-center gap-4 cursor-pointer transition-all min-w-[140px] justify-between shadow-sm ${
                    isDark 
                      ? 'bg-[#181612] border-[#38352e] text-white hover:border-[#00a76b]' 
                      : 'bg-white border-[#eceae3] text-[#201515] hover:border-[#00a76b]'
                  }`}
                >
                  {filters.roleFilter === '' ? 'All Roles' : filters.roleFilter === 'hr' ? 'HR' : filters.roleFilter === 'manager' ? 'Managers' : 'Employees'}
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === 'role' ? 'rotate-180 text-[#00a76b]' : 'rotate-0 text-[#939084]'}`} />
                </button>
                {openDropdown === 'role' && (
                  <div className={`absolute top-[calc(100%+8px)] left-0 w-full border rounded-[5px] shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#eceae3]'
                  }`}>
                    {[
                      { id: '', label: 'All Roles' },
                      { id: 'employee', label: 'Employees' },
                      { id: 'manager', label: 'Managers' },
                      { id: 'hr', label: 'HR' }
                    ].filter(opt => opt.id !== 'hr' || userRole === 'admin').map((opt) => (
                      <div key={opt.id} onClick={() => { setFilters(f => ({ ...f, roleFilter: opt.id })); setOpenDropdown(null); }}
                        className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors border-b last:border-none ${
                          isDark 
                            ? 'text-white hover:bg-[#00a76b]/10 hover:text-[#00a76b] border-[#38352e]' 
                            : 'text-[#201515] hover:bg-[#00a76b]/5 hover:text-[#00a76b] border-[#f8f8f8]'
                        }`}>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`} size={14} />
                <input
                  type="text"
                  placeholder="USER ID..."
                  value={filters.userFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, userFilter: e.target.value }))}
                  className={`pl-9 pr-4 py-2.5 w-40 rounded-[5px] border text-[11px] font-black uppercase tracking-widest focus:border-[#00a76b] outline-none shadow-sm transition-all ${
                    isDark 
                      ? 'bg-[#181612] border-[#38352e] text-white focus:bg-[#0f0d0a]' 
                      : 'bg-white border-[#E6E8EA] text-[#201515]'
                  }`}
                />
              </div>
            </>
          )}

          <button 
            onClick={fetchData} 
            className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-all shadow-sm ${
              isDark 
                ? 'bg-[#282520] text-white hover:bg-[#00a76b]' 
                : 'bg-[#F5F5F5] hover:bg-[#00a76b] hover:text-white'
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-10">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Time" value={formatHrs(data.stats.totalTime)} icon={Clock} colorClass="text-blue-500" isDark={isDark} />
          <StatsCard title="Active Time" value={formatHrs(data.stats.activeTime)} icon={Zap} colorClass="text-green-500" isDark={isDark} />
          <StatsCard title="Idle Time" value={formatHrs(data.stats.idleTime)} icon={Clock} colorClass="text-emerald-500" isDark={isDark} />
          <StatsCard title="Total Sessions" value={data.stats.sessions} icon={Activity} colorClass="text-purple-500" isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CHART SECTION */}
          <div className={`border rounded-[5px] p-8 shadow-sm ${
            isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#E6E8EA]'
          }`}>
            <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] mb-6 ${
              isDark ? 'text-white' : 'text-[#1E2026]'
            }`}>Work Hours Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key={isDark ? 'dark' : 'light'} data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#38352e' : '#F5F5F5'} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#a3a094' : '#848E9C', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#a3a094' : '#848E9C', fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F7FA' }} 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#181612' : '#fff', 
                      borderColor: isDark ? '#38352e' : '#E6E8EA', 
                      color: isDark ? '#fff' : '#000',
                      borderRadius: '5px', 
                      fontWeight: 'bold' 
                    }} 
                  />
                  <Bar dataKey="active" fill="#24A148" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="idle" fill="#FF832B" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOTIFICATIONS & ACTIVITY PANEL */}
          <div className={`border rounded-[5px] p-8 shadow-sm flex flex-col h-[380px] ${
            isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#E6E8EA]'
          }`}>
            <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-[#1E2026]'
            }`}>
              <Activity size={16} className="text-[#00a76b]" /> Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {data.activityLogs.length === 0 ? (
                <div className={`text-center text-[10px] uppercase font-black tracking-widest mt-10 ${
                  isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'
                }`}>No recent activity</div>
              ) : (
                data.activityLogs.map((log, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-[5px] transition-colors ${
                    isDark ? 'bg-[#181612] hover:bg-[#282520]' : 'bg-[#F5F7FA] hover:bg-gray-100'
                  }`}>
                    <div>
                      <p className={`text-[12px] font-black ${isDark ? 'text-white' : 'text-[#1E2026]'}`}>{log.name}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>{log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black text-[#24A148]">{formatHrs(log.activeTime)}</p>
                      <StatusBadge status={log.status} isDark={isDark} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className={`mt-8 border rounded-[5px] overflow-hidden shadow-sm ${
          isDark ? 'border-[#38352e]' : 'border-[#E6E8EA]'
        }`}>
          <div className={`p-6 border-b ${
            isDark ? 'bg-[#0f0d0a] border-[#38352e]' : 'bg-white border-[#E6E8EA]'
          }`}>
            <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${
              isDark ? 'text-white' : 'text-[#1E2026]'
            }`}>System Registry</h3>
          </div>
          <DataTable data={data.tableData} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardPanel;
