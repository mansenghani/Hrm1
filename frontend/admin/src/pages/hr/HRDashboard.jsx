import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Heart, Activity, ArrowUpRight, ShieldCheck, Search, Clock, ChevronRight, Zap, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../../components/AnalyticsChart';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, attendance: '94%' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      // Using relative paths for proxy consistency
      const [empRes, leaveRes] = await Promise.all([
        axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/leaves', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats({
        employees: empRes.data?.length || 0,
        pendingLeaves: leaveRes.data?.filter(l => l.status === 'Pending').length || 0,
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
      
      {/* ZAPIER HERO SECTION */}
      <div className="mb-24 mt-8">
        <div className="w-full">
          <p className="zap-caption-upper mb-8 text-[#ff4f00]">Personnel Automation Hub</p>
          <h1 className="zap-display-hero mb-12">
            Automate your people <br/>processes with <span className="text-[#ff4f00]">effortless clarity.</span>
          </h1>
          <p className="zap-body-large text-[#36342e] mb-12 max-w-2xl font-medium">
            The Zapier approach to HR: warm, approachable infrastructure that turns complex personnel logistics into simple workflows.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/admin/create-user')}
              className="zap-btn zap-btn-orange h-[56px] px-10 text-[16px] font-bold"
            >
              <Plus size={20} className="mr-3" />
              Register Account
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
          { label: 'Personnel Nodes', val: stats.employees, cap: 'Workflow Connected', icon: Users },
          { label: 'Active Tasks', val: stats.pendingLeaves, cap: 'Pending Sync', icon: Zap },
          { label: 'Attendance Pulse', val: stats.attendance, cap: 'Automated Status', icon: Heart }
        ].map((stat, i) => (
          <div key={i} className="zap-card group cursor-pointer hover:border-[#201515] transition-all">
             <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 rounded-[8px] bg-[#eceae3] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-[#fffefb] transition-all">
                   <stat.icon size={20} />
                </div>
                <ArrowUpRight size={18} className="text-[#c5c0b1] group-hover:text-[#201515]" />
             </div>
             <div>
                <h3 className="text-[48px] font-medium text-[#201515] leading-none mb-4 tabular-nums">{stat.val}</h3>
                <p className="text-[14px] font-bold text-[#36342e] uppercase tracking-widest">{stat.label}</p>
                <div className="mt-8 pt-6 border-t border-[#c5c0b1] flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]"></div>
                   <p className="text-[12px] font-bold text-[#939084] uppercase">{stat.cap}</p>
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

        {/* PIPELINE - Zapier Workflow Style */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex justify-between items-center mb-10 px-2">
              <h3 className="text-[32px] font-normal text-[#201515] tracking-tight">Active Pipelines</h3>
              <button onClick={fetchData} className="zap-btn zap-btn-light h-10 w-10 flex items-center justify-center p-0">
                 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
           
           <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="zap-card flex items-center justify-between hover:bg-[#fffdf9] py-6">
                   <div className="flex items-center gap-8">
                      <div className="flex items-center">
                         <div className="w-12 h-12 rounded-full bg-[#201515] flex items-center justify-center text-[#fffefb] font-bold z-10 border-2 border-[#fffefb]">
                            H
                         </div>
                         <div className="w-8 h-[2px] bg-[#c5c0b1]"></div>
                         <div className="w-12 h-12 rounded-full bg-[#ff4f00] flex items-center justify-center text-[#fffefb] font-bold -ml-1 border-2 border-[#fffefb]">
                            {i}
                         </div>
                      </div>
                      <div>
                         <p className="text-[18px] font-semibold text-[#201515]">Personnel Sync Logic: Node 0x{i}</p>
                         <p className="text-[14px] text-[#939084] flex items-center gap-2 mt-1 font-medium">
                            <Clock size={14} />
                            Automation active • 2h ago
                         </p>
                      </div>
                   </div>
                   <button className="zap-btn zap-btn-light h-10 px-5 text-[13px] rounded-[4px] border-[#c5c0b1] text-[#36342e] hover:border-[#201515]">
                    Configure
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* SIDEBAR - Warm Editorial Metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#fffdf9] border border-[#c5c0b1] rounded-[8px] p-10 relative overflow-hidden group">
              <h4 className="zap-caption-upper mb-12 text-[#ff4f00] flex items-center gap-3">
                 <Zap size={18} />
                 Workflow Pulse
              </h4>
              <div className="space-y-12">
                   <div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                         <span className="text-[#939084]">System Synergy</span>
                         <span className="text-[#201515]">92.4%</span>
                      </div>
                      <div className="h-[2px] bg-[#eceae3] rounded-full overflow-hidden">
                         <div className="h-full bg-[#ff4f00]" style={{ width: '92%' }}></div>
                      </div>
                   </div>
                   <div className="p-8 bg-[#fffefb] rounded-[5px] border border-[#c5c0b1]">
                      <p className="text-[11px] font-bold text-[#939084] uppercase tracking-[0.2em] mb-4">Operational Status</p>
                      <p className="text-[24px] font-normal text-[#201515] leading-tight">Optimized <span className="text-[#ff4f00]">{"/ "}Running</span></p>
                   </div>
              </div>
              <button className="zap-btn zap-btn-dark w-full mt-10">
                Full Analytics
              </button>
           </div>

           <div className="space-y-3">
              <button 
                  onClick={() => navigate('/hr/tasks')}
                  className="zap-btn zap-btn-light w-full h-16 justify-between px-8 bg-transparent hover:bg-[#fffdf9]"
              >
                  Review Missions
                  <ChevronRight size={20} className="text-[#c5c0b1]" />
              </button>

              <button 
                onClick={() => navigate('/admin/employees')}
                className="zap-btn zap-btn-light w-full h-16 justify-between px-8 bg-transparent hover:bg-[#fffdf9]"
              >
                  Audit Archives
                  <ChevronRight size={20} className="text-[#c5c0b1]" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
