import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarClock,
  Wallet,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: [],
    attendance: [],
    payroll: [],
    tasks: [],
    departments: 0,
    activeNodes: 0
  });
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [empRes, attRes, payRes, taskRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees', config),
        axios.get('http://localhost:5000/api/attendance', config),
        axios.get('http://localhost:5000/api/payroll', config),
        axios.get('http://localhost:5000/api/tasks', config)
      ]);

      const employees = empRes.data || [];
      const depts = new Set(employees.map(e => e.department).filter(Boolean));

      const today = new Date().toISOString().split('T')[0];
      const activeNodes = (attRes.data || []).filter(a => a.date?.startsWith(today)).length;

      setStats({
        employees: employees,
        attendance: attRes.data || [],
        payroll: payRes.data || [],
        tasks: taskRes.data || [],
        departments: depts.size || 0,
        activeNodes: activeNodes
      });
    } catch (err) {
      console.error('Data sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tickerData = [
    { pair: 'EMP/UNIT', price: stats.employees.length, change: '+100%', bullish: true },
    { pair: 'DPT/NODE', price: stats.departments, change: 'Stable', bullish: true },
    { pair: 'OPS/SYNC', price: `${stats.activeNodes} Active`, change: stats.activeNodes > 0 ? '+Active' : '-Off', bullish: stats.activeNodes > 0 },
    { pair: 'FIN/LEDGER', price: stats.payroll.length, change: 'Updated', bullish: true },
  ];

  const chartData = [
    { name: '00:00', value: 400 },
    { name: '04:00', value: 300 },
    { name: '08:00', value: 600 },
    { name: '12:00', value: 800 },
    { name: '16:00', value: 500 },
    { name: '20:00', value: 900 },
  ];

  const handleInitializeNode = () => {
    navigate('/admin/create-user');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* TICKER */}
      <div className="flex items-center gap-12 overflow-hidden py-4 border-b border-[#E6E8EA]">
        {tickerData.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0 cursor-pointer hover:bg-[#F5F5F5] px-4 py-2 rounded-lg transition-all">
            <span className="text-[14px] font-bold text-[#1E2026] uppercase">{item.pair}</span>
            <span className="text-[14px] font-black tracking-tight">{item.price}</span>
            <span className={`text-[12px] font-bold ${item.bullish ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>{item.change}</span>
          </div>
        ))}
      </div>

      {/* HERO SECTION */}
      <section className="bg-[#222126] rounded-[24px] overflow-hidden relative group p-12">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#F0B90B]/20 to-transparent rounded-full -mr-32 -mt-32 blur-[100px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-left">
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Operate the world's <br /> <span className="text-[#F0B90B]">leading personnel</span> hub.
            </h1>
            <p className="text-[#848E9C] text-[18px] font-medium mb-10 leading-relaxed">
              Experience high-fidelity operational tracing and personnel management with the security standards of a digital fortress.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-[#2B2F36] p-1 rounded-full border border-white/10 group-focus-within:border-[#F0B90B] transition-all">
                <input
                  type="text"
                  placeholder="Search node identifier..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="bg-transparent pl-6 pr-4 py-3 text-white text-sm outline-none w-64"
                />
                <button
                  onClick={fetchData}
                  className="px-8 py-3 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-sm hover:bg-[#FFD000] transition-all flex items-center gap-2"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Initialize Sync
                </button>
              </div>
            </div>
          </div>

          {/* Mockup Reveal */}
          <div className="hidden lg:block relative scale-110">
            <div className="w-64 h-[410px] bg-[#1E2026] rounded-[40px] border-[8px] border-[#2B2F36] shadow-2xl relative overflow-hidden transform rotate-6 hover:rotate-2 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-b from-[#F0B90B]/10 to-transparent"></div>
              <div className="p-6 space-y-6">
                <div className="h-4 w-20 bg-white/10 rounded-full"></div>
                <div className="h-32 w-full bg-[#2B2F36] rounded-2xl flex items-center justify-center">
                  <TrendingUp className="text-[#0ECB81] w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-white/5 rounded-full"></div>
                  <div className="h-2 w-full bg-white/5 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Personnel Nodes', val: stats.employees.length, change: 'Verified', bullish: true, icon: Users },
          { label: 'Pending Missions', val: stats.tasks.filter(t => t.status !== 'completed').length, change: stats.tasks.length > 0 ? 'Urgent' : 'Clear', bullish: stats.tasks.filter(t => t.status !== 'completed').length === 0, icon: Activity },
          { label: 'Mission Velocity', val: `${stats.tasks.length > 0 ? Math.round((stats.tasks.filter(t => t.status === 'completed').length / stats.tasks.length) * 100) : 0}%`, change: 'Operational', bullish: true, icon: TrendingUp },
          { label: 'Protocol Budget', val: `$${(stats.payroll.length * 1200).toLocaleString()}`, change: 'Current', bullish: true, icon: Wallet },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group cursor-default">
            <div className="flex items-center justify-between mb-8">
              <div className="p-2.5 rounded-lg bg-[#F5F5F5] text-[#1E2026] group-hover:bg-[#F0B90B] transition-colors">
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest ${stat.bullish ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                {stat.change}
              </div>
            </div>
            <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-[#1E2026] tabular-nums">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-12 gap-8 pb-12">
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E6E8EA] rounded-2xl p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h3 className="text-xl font-black text-[#1E2026]">Operational Sync Strength</h3>
              <p className="text-[12px] font-medium text-[#848E9C] mt-1">Real-time trace of operational expansion across segments.</p>
            </div>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="binanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F0B90B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#848E9C' }} dy={10} />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: '#F0B90B', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E6E8EA', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '16px', backgroundColor: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#F0B90B" strokeWidth={3} fill="url(#binanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#F5F5F5] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#1E2026]">Node Intelligence</h3>
              <RefreshCw
                size={16}
                className={`text-[#848E9C] cursor-pointer hover:text-[#F0B90B] transition-colors ${loading ? 'animate-spin' : ''}`}
                onClick={fetchData}
              />
            </div>
            <div className="space-y-6">
              {[
                { name: 'Payroll Sync', status: 'Syncing', perf: '22%', up: false },
                { name: 'Auth Node', status: 'Optimal', perf: '99%', up: true }
              ].map((node, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${node.up ? 'bg-[#0ECB81]' : 'bg-[#F0B90B] animate-pulse'}`}></div>
                    <span className="text-[13px] font-bold">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[11px] font-bold ${node.up ? 'text-[#0ECB81]' : 'text-[#F0B90B]'}`}>{node.status}</span>
                    <span className="text-[11px] font-black text-[#848E9C] w-10 text-right">{node.perf}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3 bg-[#1E2026] text-white rounded-lg text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2">
              <Activity size={12} />
              View Full Network
            </button>
          </div>

          <div className="bg-[#F0B90B]/5 border border-[#F0B90B]/20 rounded-2xl p-8 relative overflow-hidden group cursor-pointer hover:bg-[#F0B90B]/10 transition-all">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-[#F0B90B] uppercase tracking-widest mb-2">Protocol Export</h4>
                <p className="text-[15px] font-black text-[#1E2026]">Download Ledger</p>
              </div>
              <Download size={22} className="text-[#F0B90B] group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
