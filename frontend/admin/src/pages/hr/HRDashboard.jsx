import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Heart, Activity, ArrowUpRight, ShieldCheck, Search, Clock, ChevronRight, Zap, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../../components/AnalyticsChart';
import UnifiedDashboardPanel from '@shared/components/UnifiedDashboardPanel';
import WeeklyAttendanceChart from '@shared/components/WeeklyAttendanceChart';

const HRDashboard = () => {
   const navigate = useNavigate();
   const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, attendance: '94%' });
   const [loading, setLoading] = useState(true);

   const fetchData = async () => {
      setLoading(true);
      try {
         const token = sessionStorage.getItem('token');
         const [empRes, leaveRes] = await Promise.all([
            axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
            axios.get('/api/leaves', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
         ]);

         const employees = Array.isArray(empRes.data) ? empRes.data : [];
         const leaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];

         setStats({
            employees: employees.length,
            pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
            attendance: '94%'
         });
      } catch (err) {
         console.error('HR Sync failed:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   return (
      <div className="animate-fade-in pb-32">

         {/* VERDANT HERO SECTION */}
         <div className="mb-24 mt-8">
            <div className="w-full">
               <p className="zap-caption-upper mb-8 text-[var(--zap-orange)]">Personnel Automation Hub</p>
               <h1 className="zap-display-hero mb-12">
                  Automate your people <br />processes with <span className="text-[var(--zap-orange)]">effortless clarity.</span>
               </h1>
               <p className="zap-body-large text-[var(--zap-charcoal)] mb-12 max-w-2xl font-medium">
                  The Verdant approach to HR: warm, approachable infrastructure that turns complex personnel logistics into simple workflows.
               </p>
               <div className="flex gap-4">
                  <button
                     onClick={() => navigate('/admin/create-user')}
                     className="zap-btn zap-btn-orange h-[56px] px-10 text-[16px] font-bold"
                  >
                     <Plus size={20} className="mr-3" />
                     Create User
                  </button>
                  <button className="zap-btn zap-btn-light h-[56px] px-8">
                     Explore Workflows
                  </button>
               </div>
            </div>
         </div>

         {/* STAT COUNTERS - Zapier Minimalist Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
               { label: 'All Employees', val: stats.employees, cap: 'Workflow Connected', icon: Users },
               { label: 'Active Tasks', val: stats.pendingLeaves, cap: 'Pending Sync', icon: Zap },
               { label: 'Attendance Pulse', val: stats.attendance, cap: 'Automated Status', icon: Heart }
            ].map((stat, i) => (
               <div key={i} className="zap-card group cursor-pointer hover:border-[var(--zap-black)] transition-all">
                  <div className="flex justify-between items-start mb-12">
                     <div className="w-12 h-12 rounded-[8px] bg-[var(--zap-light-sand)] flex items-center justify-center text-[var(--zap-black)] group-hover:bg-[var(--zap-orange)] group-hover:text-[var(--zap-white)] transition-all">
                        <stat.icon size={20} />
                     </div>
                     <ArrowUpRight size={18} className="text-[var(--zap-mid-warm)] group-hover:text-[var(--zap-black)]" />
                  </div>
                  <div>
                     <h3 className="text-[48px] font-medium text-[var(--zap-black)] leading-none mb-4 tabular-nums">{stat.val}</h3>
                     <p className="text-[14px] font-bold text-[var(--zap-charcoal)] uppercase tracking-widest">{stat.label}</p>
                     <div className="mt-8 pt-6 border-t border-[var(--zap-sand)] flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--zap-orange)]"></div>
                        <p className="text-[12px] font-bold text-[var(--zap-warm-gray)] uppercase">{stat.cap}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-12 gap-12">
            {/* Main Operational Chart */}
            <div className="col-span-12 mb-12">
               <AnalyticsChart title="Organizational Sync Trace" type="area" />
            </div>

            {/* Weekly Attendance Overview Chart */}
            <div className="col-span-12 mb-12">
               <WeeklyAttendanceChart isZapTheme={true} className="zap-card flex flex-col w-full transition-all duration-300" />
            </div>

            {/* PIPELINE - Zapier Workflow Style */}
            <div className="col-span-12 lg:col-span-8">
               <div className="flex justify-between items-center mb-10 px-2">
                  <h3 className="text-[32px] font-normal text-[var(--zap-black)] tracking-tight">Active Pipelines</h3>
                  <button onClick={fetchData} className="zap-btn zap-btn-light h-10 w-10 flex items-center justify-center p-0">
                     <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
               </div>

               <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="zap-card flex items-center justify-between hover:bg-[var(--zap-off-white)] py-6">
                        <div className="flex items-center gap-8">
                           <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full bg-[var(--zap-black)] flex items-center justify-center text-[var(--zap-cream)] font-bold z-10 border-2 border-[var(--zap-cream)]">
                                 H
                              </div>
                              <div className="w-8 h-[2px] bg-[var(--zap-sand)]"></div>
                              <div className="w-12 h-12 rounded-full bg-[var(--zap-orange)] flex items-center justify-center text-[var(--zap-white)] font-bold -ml-1 border-2 border-[var(--zap-cream)]">
                                 {i}
                              </div>
                           </div>
                           <div>
                              <p className="text-[18px] font-semibold text-[var(--zap-black)]">Personnel Sync Logic: Node 0x{i}</p>
                              <p className="text-[14px] text-[var(--zap-warm-gray)] flex items-center gap-2 mt-1 font-medium">
                                 <Clock size={14} />
                                 Automation active • 2h ago
                              </p>
                           </div>
                        </div>
                        <button className="zap-btn zap-btn-light h-10 px-5 text-[13px] rounded-[4px] border-[var(--zap-sand)] text-[var(--zap-charcoal)] hover:border-[var(--zap-black)]">
                           Configure
                        </button>
                     </div>
                  ))}
               </div>
            </div>

            {/* SIDEBAR - Warm Editorial Metrics */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-[var(--zap-off-white)] border border-[var(--zap-sand)] rounded-[8px] p-10 relative overflow-hidden group">
                  <h4 className="zap-caption-upper mb-12 text-[var(--zap-orange)] flex items-center gap-3">
                     <Zap size={18} />
                     Workflow Pulse
                  </h4>
                  <div className="space-y-12">
                     <div>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                           <span className="text-[var(--zap-warm-gray)]">System Synergy</span>
                           <span className="text-[var(--zap-black)]">92.4%</span>
                        </div>
                        <div className="h-[2px] bg-[var(--zap-light-sand)] rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--zap-orange)]" style={{ width: '92%' }}></div>
                        </div>
                     </div>
                     <div className="p-8 bg-[var(--zap-cream)] rounded-[5px] border border-[var(--zap-sand)]">
                        <p className="text-[11px] font-bold text-[var(--zap-warm-gray)] uppercase tracking-[0.2em] mb-4">Operational Status</p>
                        <p className="text-[24px] font-normal text-[var(--zap-black)] leading-tight">Optimized <span className="text-[var(--zap-orange)]">{"/ "}Running</span></p>
                     </div>
                  </div>
                  <button className="zap-btn zap-btn-dark w-full mt-10">
                     Full Analytics
                  </button>
               </div>

               <div className="space-y-3">
                  <button
                     onClick={() => navigate('/hr/tasks')}
                     className="zap-btn zap-btn-light w-full h-16 justify-between px-8 bg-transparent hover:bg-[var(--zap-off-white)]"
                  >
                     Review Missions
                     <ChevronRight size={20} className="text-[var(--zap-mid-warm)]" />
                  </button>

                  <button
                     onClick={() => navigate('/admin/employees')}
                     className="zap-btn zap-btn-light w-full h-16 justify-between px-8 bg-transparent hover:bg-[var(--zap-off-white)]"
                  >
                     Audit Archives
                     <ChevronRight size={20} className="text-[var(--zap-mid-warm)]" />
                  </button>
               </div>
            </div>
         </div>

         {/* UNIFIED ROLE-BASED DASHBOARD COMPONENT */}
         <UnifiedDashboardPanel />
      </div>
   );
};

export default HRDashboard;
