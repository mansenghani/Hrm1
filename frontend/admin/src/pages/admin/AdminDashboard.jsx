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
  Download,
  RefreshCw,
  Plus,
  Zap,
  ShieldCheck,
  Clock
} from 'lucide-react';
import AnalyticsChart from '../../components/AnalyticsChart';

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
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [empRes, attRes, payRes, taskRes] = await Promise.all([
        axios.get('/api/employees', config),
        axios.get('/api/attendance', config),
        axios.get('/api/payroll', config),
        axios.get('/api/tasks/admin-all', config)
      ]);

      const employees = empRes.data || [];
      const depts = new Set(employees.map(e => e.department?.name || e.department).filter(Boolean));

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

  const chartData = [
    { name: '00:00', value: 400 },
    { name: '04:00', value: 300 },
    { name: '08:00', value: 600 },
    { name: '12:00', value: 800 },
    { name: '16:00', value: 500 },
    { name: '20:00', value: 900 },
  ];

  return (
    <div className="animate-fade-in pb-24">
      {/* HEADER SECTION */}
      <div className="mb-12 border-b border-[#c5c0b1] pb-10 flex justify-between items-end">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Ecosystem Intelligence</p>
          <h1 className="zap-display-hero">Institutional <span className="text-[#ff4f00]">Control.</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="zap-btn zap-btn-light h-14 px-6">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="zap-btn zap-btn-orange h-14 px-10">
             <span>Export Protocol</span>
             <Download size={20} className="ml-4" />
          </button>
        </div>
      </div>

      {/* KPI GRID - Zapier Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: 'Personnel Nodes', val: stats.employees.length, icon: Users, status: 'Verified' },
          { label: 'Network Operations', val: stats.activeNodes, icon: Activity, status: 'Live' },
          { label: 'Task Velocity', val: `${stats.tasks.length > 0 ? Math.round((stats.tasks.filter(t => t.status === 'completed').length / stats.tasks.length) * 100) : 0}%`, icon: TrendingUp, status: 'Optimal' },
          { label: 'Organization Units', val: stats.departments, icon: Building2, status: 'Active' },
        ].map((stat, i) => (
          <div key={i} className="zap-card group cursor-pointer hover:border-[#201515] transition-all">
            <div className="flex justify-between items-start mb-10">
               <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-[#fffefb] transition-all">
                  <stat.icon size={20} />
               </div>
               <span className="text-[11px] font-bold text-[#ff4f00] uppercase tracking-widest">{stat.status}</span>
            </div>
            <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className="text-[36px] font-medium text-[#201515] tabular-nums leading-none">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* DASH CONTENT */}
      <div className="grid grid-cols-12 gap-12">
        {/* Main Analytics */}
        <div className="col-span-12 lg:col-span-8">
           <AnalyticsChart title="Institutional Activity Pulse" type="bar" />
        </div>

        {/* Intelligence / Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <div className="zap-card flex-1 p-10">
              <div className="flex items-center gap-3 mb-10 text-[#ff4f00]">
                 <Zap size={20} />
                 <h3 className="zap-caption-upper !text-[#ff4f00]">Node Diagnostics</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { name: 'Auth Node Alpha', status: 'Optimal', up: true },
                   { name: 'Database Relay', status: 'Syncing', up: true },
                   { name: 'Payroll Ledger', status: 'Stable', up: true },
                   { name: 'Task Orchestrator', status: 'Optimal', up: true },
                 ].map((node, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-[#eceae3] pb-6 last:border-none">
                      <div className="flex items-center gap-4">
                         <div className={`w-2 h-2 rounded-full ${node.up ? 'bg-[#24a148]' : 'bg-[#ff4f00]'}`}></div>
                         <span className="text-[14px] font-bold text-[#201515]">{node.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#939084] uppercase tracking-wider">{node.status}</span>
                   </div>
                 ))}
              </div>
              <button className="zap-btn zap-btn-light w-full mt-10">
                 Run Full Diagnostic
              </button>
           </div>

           <div 
             onClick={() => navigate('/admin/create-user')}
             className="zap-btn !bg-[#ff4f00] !h-auto p-10 flex flex-col items-start gap-4 group cursor-pointer border-none shadow-xl"
           >
              <div className="flex justify-between items-center w-full">
                 <p className="zap-caption-upper !text-white opacity-90 group-hover:opacity-100 transition-opacity">Global Initialization</p>
                 <Plus size={24} className="text-white" />
              </div>
              <h4 className="text-[24px] font-bold text-white">Create User Node</h4>
              <p className="text-[14px] text-white font-medium opacity-90">Add a new personnel entity to the organizational matrix.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
