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
const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white border border-[#E6E8EA] p-6 rounded-[5px] shadow-sm flex flex-col justify-between group hover:border-[#ff4f00] transition-all">
    <div className="flex justify-between items-center mb-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">{title}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-opacity-80 transition-all ${colorClass}`}>
        <Icon size={16} />
      </div>
    </div>
    <div className="text-2xl font-black text-[#1E2026] tracking-tighter">
      {value}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-orange-100 text-orange-700',
    paused: 'bg-gray-100 text-gray-700',
    completed: 'bg-blue-100 text-blue-700'
  };
  const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
      {status || 'Unknown'}
    </span>
  );
};

const DataTable = ({ data }) => (
  <div className="overflow-x-auto w-full">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#F5F7FA] border-b border-[#E6E8EA]">
          <th className="px-6 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Name</th>
          <th className="px-6 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Role</th>
          <th className="px-6 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] text-center">Today Hours</th>
          <th className="px-6 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] text-center">Status</th>
          <th className="px-6 py-4 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] text-right">Last Activity</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E6E8EA]">
        {data.length === 0 ? (
          <tr>
            <td colSpan="5" className="py-12 text-center text-[#848E9C] font-black text-[12px] uppercase tracking-widest">
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-[13px] font-bold text-[#1E2026]">{row.name}</td>
              <td className="px-6 py-4 text-[11px] font-bold text-[#848E9C] uppercase tracking-widest">{row.role}</td>
              <td className="px-6 py-4 text-[14px] font-black text-[#1E2026] text-center tabular-nums">
                {Math.floor(row.todayHours / 3600)}h {Math.floor((row.todayHours % 3600) / 60)}m
              </td>
              <td className="px-6 py-4 text-center"><StatusBadge status={row.status} /></td>
              <td className="px-6 py-4 text-[11px] font-bold text-[#848E9C] text-right">
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
    <div className="w-full bg-white rounded-[5px] shadow-xl border border-[#E6E8EA] overflow-hidden">
      {/* HEADER & FILTERS */}
      <div className="p-10 border-b border-[#E6E8EA] bg-[#F8FAFC] flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h2 className="text-[18px] font-black text-[#1E2026] uppercase tracking-[0.2em]">Operational Overview</h2>
          <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-widest mt-1">Unified Performance Metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* TIME RANGE DROPDOWN */}
          <div className="relative" ref={timeRef}>
            <button 
              onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
              className="px-4 py-2.5 bg-white border border-[#eceae3] rounded-[5px] text-[10px] font-black uppercase tracking-widest text-[#201515] outline-none flex items-center gap-4 cursor-pointer transition-all hover:border-[#ff4f00] min-w-[140px] justify-between shadow-sm"
            >
              {filters.timeRange === 'today' ? 'Today' : filters.timeRange === 'weekly' ? 'This Week' : 'This Month'}
              <ChevronDown size={14} className={`transition-transform ${openDropdown === 'time' ? 'rotate-180 text-[#ff4f00]' : 'rotate-0 text-[#939084]'}`} />
            </button>
            {openDropdown === 'time' && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#eceae3] rounded-[5px] shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'weekly', label: 'This Week' },
                  { id: 'monthly', label: 'This Month' }
                ].map((opt) => (
                  <div key={opt.id} onClick={() => { setFilters(f => ({ ...f, timeRange: opt.id })); setOpenDropdown(null); }}
                    className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#201515] hover:bg-[#ff4f00]/5 hover:text-[#ff4f00] cursor-pointer transition-colors border-b border-[#f8f8f8] last:border-none">
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
                  className="px-4 py-2.5 bg-white border border-[#eceae3] rounded-[5px] text-[10px] font-black uppercase tracking-widest text-[#201515] outline-none flex items-center gap-4 cursor-pointer transition-all hover:border-[#ff4f00] min-w-[140px] justify-between shadow-sm"
                >
                  {filters.roleFilter === '' ? 'All Roles' : filters.roleFilter === 'hr' ? 'HR' : filters.roleFilter === 'manager' ? 'Managers' : 'Employees'}
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === 'role' ? 'rotate-180 text-[#ff4f00]' : 'rotate-0 text-[#939084]'}`} />
                </button>
                {openDropdown === 'role' && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#eceae3] rounded-[5px] shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {[
                      { id: '', label: 'All Roles' },
                      { id: 'employee', label: 'Employees' },
                      { id: 'manager', label: 'Managers' },
                      { id: 'hr', label: 'HR' }
                    ].filter(opt => opt.id !== 'hr' || userRole === 'admin').map((opt) => (
                      <div key={opt.id} onClick={() => { setFilters(f => ({ ...f, roleFilter: opt.id })); setOpenDropdown(null); }}
                        className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#201515] hover:bg-[#ff4f00]/5 hover:text-[#ff4f00] cursor-pointer transition-colors border-b border-[#f8f8f8] last:border-none">
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C]" size={14} />
                <input
                  type="text"
                  placeholder="USER ID..."
                  value={filters.userFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, userFilter: e.target.value }))}
                  className="pl-9 pr-4 py-2.5 w-40 rounded-[5px] border border-[#E6E8EA] text-[11px] font-black uppercase tracking-widest bg-white focus:border-[#ff4f00] outline-none shadow-sm transition-all"
                />
              </div>
            </>
          )}

          <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] hover:bg-[#ff4f00] hover:text-white rounded-[5px] transition-all shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-10">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Time" value={formatHrs(data.stats.totalTime)} icon={Clock} colorClass="text-blue-500" />
          <StatsCard title="Active Time" value={formatHrs(data.stats.activeTime)} icon={Zap} colorClass="text-green-500" />
          <StatsCard title="Idle Time" value={formatHrs(data.stats.idleTime)} icon={Clock} colorClass="text-orange-500" />
          <StatsCard title="Total Sessions" value={data.stats.sessions} icon={Activity} colorClass="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CHART SECTION */}
          <div className="lg:col-span-2 bg-white border border-[#E6E8EA] rounded-[5px] p-8 shadow-sm">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026] mb-6">Work Hours Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#848E9C', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#848E9C', fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#F5F7FA' }} 
                    contentStyle={{ borderRadius: '5px', border: '1px solid #E6E8EA', fontWeight: 'bold' }} 
                    formatter={(value, name) => {
                      const totalSecs = Math.round((Number(value) || 0) * 3600);
                      const h = Math.floor(totalSecs / 3600);
                      const m = Math.floor((totalSecs % 3600) / 60);
                      const formattedName = name === 'active' ? 'Active' : (name === 'idle' ? 'Idle' : name);
                      return [`${h}h ${m}m`, formattedName];
                    }}
                  />
                  <Bar dataKey="active" fill="#24A148" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="idle" fill="#FF832B" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOTIFICATIONS & ACTIVITY PANEL */}
          <div className="bg-white border border-[#E6E8EA] rounded-[5px] p-8 shadow-sm flex flex-col h-[380px]">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026] mb-6 flex items-center gap-2">
              <Activity size={16} className="text-[#ff4f00]" /> Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {data.activityLogs.length === 0 ? (
                <div className="text-center text-[#848E9C] text-[10px] uppercase font-black tracking-widest mt-10">No recent activity</div>
              ) : (
                data.activityLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-[#F5F7FA] rounded-[5px] hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-[12px] font-black text-[#1E2026]">{log.name}</p>
                      <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">{log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black text-[#24A148]">{formatHrs(log.activeTime)}</p>
                      <StatusBadge status={log.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="mt-8 border border-[#E6E8EA] rounded-[5px] overflow-hidden shadow-sm">
          <div className="bg-white p-6 border-b border-[#E6E8EA]">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026]">System Registry</h3>
          </div>
          <DataTable data={data.tableData} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardPanel;
