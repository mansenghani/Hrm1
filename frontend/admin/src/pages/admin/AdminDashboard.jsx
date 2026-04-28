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
  Clock,
} from 'lucide-react';
import AnalyticsChart from '../../components/AnalyticsChart';
import UnifiedDashboardPanel from '@shared/components/UnifiedDashboardPanel';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: [],
    attendance: [],
    payroll: [],
    tasks: [],
    activeNodes: 0
  });
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [empRes, attRes, payRes, taskRes] = await Promise.all([
        axios.get('/api/employees', config).catch(() => ({ data: [] })),
        axios.get('/api/attendance', config).catch(() => ({ data: [] })),
        axios.get('/api/payroll', config).catch(() => ({ data: [] })),
        axios.get('/api/tasks/all', config).catch(() => ({ data: [] }))
      ]);

      const employees = empRes.data || [];


      const today = new Date().toISOString().split('T')[0];
      const activeNodes = (attRes.data || []).filter(a => a.date?.startsWith(today)).length;

      setStats({
        employees: employees,
        attendance: attRes.data || [],
        payroll: payRes.data || [],
        tasks: taskRes.data || [],
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
          { label: 'All Employees', val: stats.employees.length, icon: Users, status: 'Verified' },
          { label: 'Network Operations', val: stats.activeNodes, icon: Activity, status: 'Live' },
          { label: 'Task Velocity', val: `${stats.tasks.length > 0 ? Math.round((stats.tasks.filter(t => t.status === 'completed').length / stats.tasks.length) * 100) : 0}%`, icon: TrendingUp, status: 'Optimal' },
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
        <div className="col-span-12 lg:col-span-8 space-y-12">
           <AnalyticsChart title="Institutional Activity Pulse" type="bar" />

           {/* EMPLOYEE REGISTRY LIST */}
           <div className="zap-card p-10">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#eceae3]">
                 <div>
                    <h3 className="text-[20px] font-bold text-[#201515]">Active Personnel Registry</h3>
                    <p className="text-[12px] font-bold text-[#939084] uppercase tracking-widest mt-1">Live Institutional Nodes</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-[#ff4f00] uppercase tracking-[0.2em]">Matrix View</span>
                    <Users size={18} className="text-[#ff4f00]" />
                 </div>
              </div>

              <div className="space-y-4">
                 {stats.employees.slice(page * 6, (page + 1) * 6).map((emp, i) => (
                    <div key={emp._id} className="flex items-center justify-between p-4 hover:bg-[#fffdf9] rounded-[8px] border border-transparent hover:border-[#eceae3] transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-full bg-[#eceae3] overflow-hidden border border-[#c5c0b1]">
                             {emp.profileImage ? (
                               <img src={emp.profileImage} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center font-black text-[#201515] uppercase">{emp.fullName?.[0] || 'U'}</div>
                             )}
                          </div>
                          <div>
                             <p className="text-[15px] font-bold text-[#201515] group-hover:text-[#ff4f00] transition-colors">{emp.fullName}</p>
                             <p className="text-[11px] font-bold text-[#939084] uppercase tracking-wider">{emp.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-10">
                          <div className="hidden md:block">
                             <p className="text-[11px] font-bold text-[#939084] uppercase tracking-widest mb-1">Assigned ID</p>
                             <p className="text-[13px] font-bold text-[#201515]">{emp.employeeId}</p>
                          </div>
                          <button 
                            onClick={() => navigate(`/admin/employees/edit/${emp._id}`)}
                            className="w-10 h-10 rounded-full bg-white border border-[#c5c0b1] flex items-center justify-center text-[#939084] hover:border-[#ff4f00] hover:text-[#ff4f00] transition-all"
                          >
                             <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>

              {stats.employees.length > 6 && (
                <div className="mt-10 pt-8 border-t border-[#eceae3] flex justify-between items-center">
                   <button 
                     disabled={page === 0}
                     onClick={() => setPage(p => p - 1)}
                     className="zap-btn zap-btn-light !h-10 !px-6 disabled:opacity-30"
                   >
                     Previous
                   </button>
                   <p className="text-[11px] font-black text-[#939084] uppercase tracking-[0.2em]">Page {page + 1} of {Math.ceil(stats.employees.length / 6)}</p>
                   <button 
                     disabled={(page + 1) * 6 >= stats.employees.length}
                     onClick={() => setPage(p => p + 1)}
                     className="zap-btn zap-btn-orange !h-10 !px-8"
                   >
                     Next
                   </button>
                </div>
              )}
           </div>
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
              <h4 className="text-[24px] font-bold text-white">Create User</h4>
              <p className="text-[14px] text-white font-medium opacity-90">Add a new personnel entity to the organizational matrix.</p>
           </div>
        </div>
      </div>

      {/* UNIFIED ROLE-BASED DASHBOARD COMPONENT */}
      <UnifiedDashboardPanel />
    </div>
  );
};

export default AdminDashboard;
