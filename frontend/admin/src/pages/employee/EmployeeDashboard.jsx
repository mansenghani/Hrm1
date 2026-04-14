import React from 'react';
import { Fingerprint, Calendar, Activity, Rocket, User, Clock, ArrowUpRight, CheckCircle, Bell, ExternalLink } from 'lucide-react';

const EmployeeDashboard = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            My <span className="text-[#F0B90B]">Workspace</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Personnel Activity Monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-[#0ECB81]/10 text-[#0ECB81] rounded-full border border-[#0ECB81]/20">
              <div className="w-1.5 h-1.5 bg-[#0ECB81] rounded-full animate-pulse"></div>
              <span className="text-[11px] font-black uppercase tracking-widest">Active Sync: 09:42 AM</span>
           </div>
           <button className="p-3 bg-white border border-[#E6E8EA] rounded-full hover:bg-[#F5F5F5] transition-all relative">
              <Bell size={18} className="text-[#1E2026]" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F6465D] border-2 border-white rounded-full"></div>
           </button>
        </div>
      </div>

      {/* INTELLIGENCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Presence', val: '100%', cap: 'Perfect Sync', icon: Fingerprint, color: 'text-[#0ECB81]' },
          { label: 'Task Arcs', val: '05', cap: 'Active Pipelines', icon: Activity, color: 'text-[#F0B90B]' },
          { label: 'Leave Balance', val: '14', cap: 'Node Days Available', icon: Calendar, color: 'text-[#1EAEDB]' },
          { label: 'Next Review', val: '12d', cap: 'Performance Cycle', icon: Rocket, color: 'text-[#7000FF]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[#F5F5F5] rounded-full -mr-8 -mt-8 group-hover:bg-[#F0B90B] group-hover:scale-110 transition-all opacity-50"></div>
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`p-2.5 rounded-lg bg-[#F5F5F5] ${stat.color} group-hover:bg-white transition-all`}>
                   <stat.icon size={20} />
                </div>
                <ArrowUpRight size={14} className="text-[#848E9C] opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div className="relative z-10">
                <h3 className="text-3xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em]">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Timeline Hub */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E6E8EA] rounded-3xl p-10 flex flex-col">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#F5F5F5]">
              <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em]">Activity Trace Timeline</h3>
              <ExternalLink size={16} className="text-[#848E9C] cursor-pointer" />
           </div>
           <div className="space-y-8">
              {[
                { time: '10:15 AM', event: 'Task "Core Architecture Sync" status updated', icon: Activity, type: 'System' },
                { time: '09:42 AM', event: 'Personnel Login: Entry Protocol Verified', icon: CheckCircle, type: 'Auth' },
                { time: 'Yesterday', event: 'Leave Request Approved by Management Node', icon: Calendar, type: 'Admin' }
              ].map((act, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#848E9C] group-hover:text-[#F0B90B] group-hover:bg-[#F0B90B]/10 transition-all border border-[#E6E8EA]">
                         <act.icon size={18} />
                      </div>
                      {i !== 2 && <div className="w-[2px] h-full bg-[#F5F5F5] mt-2"></div>}
                   </div>
                   <div className="pb-4">
                      <p className="text-[14px] font-black text-[#1E2026] group-hover:text-[#F0B90B] transition-colors">{act.event}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] font-black text-[#848E9C] uppercase">{act.time}</span>
                         <span className="w-1 h-1 rounded-full bg-[#E6E8EA]"></span>
                         <span className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">{act.type}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Quick Hub */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#F5F5F5]/50 border border-[#E6E8EA] rounded-3xl p-10">
              <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-10">Quick Actions Hub</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Claim Leave', icon: Calendar },
                   { label: 'Clock Trace', icon: Clock },
                   { label: 'Sync KPI', icon: Activity },
                   { label: 'Help Node', icon: User }
                 ].map((btn, idx) => (
                   <button key={idx} className="p-6 bg-white border border-[#E6E8EA] rounded-2xl group hover:border-[#F0B90B] transition-all text-center flex flex-col items-center gap-3">
                      <btn.icon size={20} className="text-[#848E9C] group-hover:text-[#F0B90B] transition-colors" opacity={0.6} />
                      <span className="text-[10px] font-black text-[#1E2026] uppercase tracking-tight">{btn.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-[#1E2026] rounded-3xl p-10 text-white relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
              <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em] mb-4">Benefit Alignment</p>
              <h4 className="text-xl font-black mb-10">Logic Pool Sync <span className="text-[#F0B90B]">65%</span></h4>
              <div className="space-y-3">
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F0B90B] shadow-[0_0_10px_rgba(240,185,11,0.5)] transition-all" style={{ width: '65%' }}></div>
                 </div>
                 <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest text-right">Target 100% Verified</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
