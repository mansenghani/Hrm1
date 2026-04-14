import React from 'react';
import { Rocket, Target, Users, Zap, ArrowUpRight, CheckCircle, Activity, BarChart3, Clock, Plus } from 'lucide-react';

const ManagerDashboard = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Manager <span className="text-[#F0B90B]">Control</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Team Orchestration & Performance Telemetry
          </p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-[#F5F5F5] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#E6E8EA] transition-all flex items-center gap-2">
              <Users size={16} />
              Team Hub
           </button>
           <button className="bg-[#1E2026] text-white px-8 py-4 rounded-full font-black text-[12px] uppercase tracking-wider shadow-lg hover:bg-black transition-all flex items-center gap-3">
              <Plus size={18} />
              Spawn Task
           </button>
        </div>
      </div>

      {/* TEAM INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Team Velocity', val: '86%', cap: 'Optimal Logic', icon: Zap, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
          { label: 'Pending Reviews', val: '04', cap: 'High Importance', icon: Activity, color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10' },
          { label: 'Active Pipelines', val: '18', cap: 'Pulse Steady', icon: Rocket, color: 'text-[#1EAEDB]', bg: 'bg-[#1EAEDB]/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-2xl group hover:shadow-[0_8px_24px_rgba(32,32,37,0.05)] transition-all relative overflow-hidden">
             <div className="flex justify-between items-start mb-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon size={24} />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6E8EA]"></div>
             </div>
             <div className="relative z-10">
                <h3 className="text-4xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.15em]">{stat.label}</p>
                <p className="mt-4 text-[9px] font-bold text-[#848E9C] uppercase tracking-[0.2em]">{stat.cap}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Task Pulse Analytics */}
        <div className="col-span-12 lg:col-span-7 bg-[#222126] rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F0B90B]/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-[3s]"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <BarChart3 size={18} className="text-[#F0B90B]" />
                    Task Progress Trace
                 </h3>
                 <span className="text-[10px] font-black uppercase text-[#848E9C] tracking-[0.2em]">Cycle 02.94</span>
              </div>
              <div className="space-y-10">
                 {[
                   { name: 'Architecture Infrastructure Sync', val: 78 },
                   { name: 'Core API Hub Verification', val: 42 },
                   { name: 'Frontend Aesthetic Deployment', val: 95 }
                 ].map((task, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest leading-none">
                         <span className="text-[#848E9C]">{task.name}</span>
                         <span className="text-[#F0B90B] tabular-nums">{task.val}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                         <div className={`h-full bg-[#F0B90B] shadow-[0_0_10px_rgba(240,185,11,0.5)] transition-all duration-1000`} style={{ width: `${task.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Personnel Hub */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-[#E6E8EA] rounded-[40px] p-10 flex flex-col justify-between group hover:border-[#F0B90B] transition-all">
           <div>
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-[14px] font-black text-[#1E2026] uppercase tracking-[0.2em]">Active Team Hub</h3>
                 <Target size={20} className="text-[#848E9C]" />
              </div>
              <div className="flex flex-wrap gap-4 mb-10">
                 {[1, 2, 3, 4, 5, 6].map(i => (
                   <div key={i} className="w-12 h-12 rounded-2xl bg-[#F5F5F5] border border-[#E6E8EA] flex items-center justify-center text-[#1E2026] font-black text-xs hover:border-[#F0B90B] transition-colors cursor-pointer">
                      P{i}
                   </div>
                 ))}
                 <div className="w-12 h-12 rounded-2xl bg-[#F0B90B] flex items-center justify-center text-[#1E2026] font-black text-xs">+12</div>
              </div>
              <div className="p-6 bg-[#F5F5F5] rounded-2xl border border-transparent group-hover:bg-[#F0B90B]/5 transition-colors">
                 <p className="text-[11px] font-black text-[#1E2026] uppercase mb-1">Efficiency Index</p>
                 <p className="text-2xl font-black text-[#1E2026]">98.4 <span className="text-[12px] text-[#848E9C]">Pulse</span></p>
              </div>
           </div>
           <button className="w-full mt-10 py-5 bg-[#1E2026] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3">
              Consult Team Analytics
              <ArrowUpRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
