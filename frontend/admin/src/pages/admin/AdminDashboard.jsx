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
  ChevronRight,
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
  const [filterRole, setFilterRole] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  // 🛡️ CLOSE DROPDOWN ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredEmployees = stats.employees.filter(emp => {
    if (filterRole === 'all') return true;
    return emp.role?.toLowerCase() === filterRole.toLowerCase();
  });

  return (
    <div className="animate-fade-in pb-40 flex flex-col gap-16">
      {/* 1. HEADER SECTION */}
      <div className="border-b border-[#c5c0b1] pb-10 flex justify-between items-end">
        <div>
          <p className="zap-caption-upper text-[#00a76b] mb-4">Workforce OS Intelligence</p>
          <h1 className="zap-display-hero">Verdant <span className="text-[#00a76b]">Control.</span></h1>
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

      {/* 2. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'All Employees', val: stats.employees.length, icon: Users, status: 'Verified' },
          { label: 'Network Operations', val: stats.activeNodes, icon: Activity, status: 'Live' },
          { label: 'Task Velocity', val: `${stats.tasks.length > 0 ? Math.round((stats.tasks.filter(t => t.status === 'completed').length / stats.tasks.length) * 100) : 0}%`, icon: TrendingUp, status: 'Optimal' },
        ].map((stat, i) => (
          <div key={i} className="zap-card group cursor-pointer hover:border-[#201515] transition-all">
            <div className="flex justify-between items-start mb-10">
               <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#00a76b] group-hover:text-[#fffefb] transition-all">
                  <stat.icon size={20} />
               </div>
               <span className="text-[11px] font-bold text-[#00a76b] uppercase tracking-widest">{stat.status}</span>
            </div>
            <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className="text-[36px] font-medium text-[#201515] tabular-nums leading-none">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* 3. UNIFIED PANEL */}
      <div className="w-full">
        <UnifiedDashboardPanel />
      </div>

      {/* 4. DASH CONTENT - REGISTRY & DIAGNOSTICS */}
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-8 space-y-12">
           {/* EMPLOYEE REGISTRY LIST */}
           <div className="zap-card p-10">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#eceae3]">
                 <div>
                    <h3 className="text-[20px] font-bold text-[#201515]">Active Personnel Registry</h3>
                    <p className="text-[12px] font-bold text-[#939084] uppercase tracking-widest mt-1">Live Institutional Nodes</p>
                 </div>
                 <div className="flex items-center gap-3">
                    {/* CUSTOM ROUNDED DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-4 py-2 bg-[#fffdf9] border border-[#00a76b] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00a76b] outline-none flex items-center gap-2 cursor-pointer transition-all hover:bg-[#00a76b]/5 min-w-[120px] justify-between"
                      >
                        {filterRole === 'all' ? 'All Roles' : filterRole}
                        <ChevronRight size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-90' : 'rotate-0'}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#eceae3] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {['all', 'hr', 'manager', 'employee'].map((role) => (
                            <div 
                              key={role}
                              onClick={() => {
                                setFilterRole(role);
                                setPage(0);
                                setIsDropdownOpen(false);
                              }}
                              className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#201515] hover:bg-[#00a76b]/5 hover:text-[#00a76b] cursor-pointer transition-colors border-b border-[#f8f8f8] last:border-none"
                            >
                              {role === 'all' ? 'All Roles' : role}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Users size={18} className="text-[#00a76b]" />
                 </div>
              </div>

              <div className="space-y-4">
                 {filteredEmployees.slice(page * 6, (page + 1) * 6).map((emp) => (
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
                             <p className="text-[15px] font-bold text-[#201515] group-hover:text-[#00a76b] transition-colors">{emp.fullName}</p>
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
                            className="w-10 h-10 rounded-full bg-white border border-[#c5c0b1] flex items-center justify-center text-[#939084] hover:border-[#00a76b] hover:text-[#00a76b] transition-all"
                          >
                             <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>

              {filteredEmployees.length > 6 && (
                <div className="mt-10 pt-8 border-t border-[#eceae3] flex justify-between items-center">
                   <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="zap-btn zap-btn-light !h-10 !px-6 disabled:opacity-30">Previous</button>
                   <p className="text-[11px] font-black text-[#939084] uppercase tracking-[0.2em]">Page {page + 1} of {Math.ceil(filteredEmployees.length / 6)}</p>
                   <button disabled={(page + 1) * 6 >= filteredEmployees.length} onClick={() => setPage(p => p + 1)} className="zap-btn zap-btn-orange !h-10 !px-8">Next</button>
                </div>
              )}
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <div className="zap-card flex-1 p-10">
              <div className="flex items-center gap-3 mb-10 text-[#00a76b]">
                 <Zap size={20} />
                 <h3 className="zap-caption-upper !text-[#00a76b]">Node Diagnostics</h3>
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
                         <div className={`w-2 h-2 rounded-full ${node.up ? 'bg-[#24a148]' : 'bg-[#00a76b]'}`}></div>
                         <span className="text-[14px] font-bold text-[#201515]">{node.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#939084] uppercase tracking-wider">{node.status}</span>
                   </div>
                 ))}
              </div>
              <button className="zap-btn zap-btn-light w-full mt-10">Run Full Diagnostic</button>
           </div>

           <div onClick={() => navigate('/admin/create-user')} className="zap-btn !bg-[#00a76b] !h-auto p-10 flex flex-col items-start gap-4 group cursor-pointer border-none shadow-xl">
              <div className="flex justify-between items-center w-full">
                 <p className="zap-caption-upper !text-white opacity-90 group-hover:opacity-100 transition-opacity">Global Initialization</p>
                 <Plus size={24} className="text-white" />
              </div>
              <h4 className="text-[24px] font-bold text-white">Create User</h4>
              <p className="text-[14px] text-white font-medium opacity-90">Add a new personnel entity to the organizational matrix.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
