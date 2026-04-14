import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Heart, Activity, ArrowUpRight, ShieldCheck, Search, Clock } from 'lucide-react';

const HRDashboard = () => {
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, attendance: '94%' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [empRes, leaveRes] = await Promise.all([
          axios.get('http://localhost:5000/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/leaves', { headers: { Authorization: `Bearer ${token}` } })
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
    fetchData();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HR HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            HR <span className="text-[#F0B90B]">Command</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Talent Acquisition & Logistics Node
          </p>
        </div>
        <button className="bg-[#F0B90B] text-[#1E2026] px-10 py-4 rounded-full font-black text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#FFD000] transition-all flex items-center gap-3">
          <UserPlus size={18} />
          Register Personnel
        </button>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Personnel Units', val: stats.employees, cap: '+4 New Nodes', icon: Users, color: 'text-[#1EAEDB]', bg: 'bg-[#1EAEDB]/10' },
          { label: 'Pending Protocols', val: stats.pendingLeaves, cap: 'Action Required', icon: ShieldCheck, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
          { label: 'Presence Pulse', val: stats.attendance, cap: 'Optimal Logic', icon: Heart, color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-2xl group hover:shadow-[0_8px_24px_rgba(32,32,37,0.05)] transition-all overflow-hidden relative">
             <div className="flex justify-between items-start mb-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon size={24} />
                </div>
                <ArrowUpRight size={16} className="text-[#848E9C] opacity-0 group-hover:opacity-100 transition-all" />
             </div>
             <div className="relative z-10">
                <h3 className="text-4xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.15em]">{stat.label}</p>
                <div className="mt-4 flex items-center gap-2 opacity-60">
                   <div className="w-1 h-1 rounded-full bg-[#848E9C]"></div>
                   <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">{stat.cap}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Operations Hub */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E6E8EA] rounded-3xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
           <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex justify-between items-center">
              <div>
                 <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-1">Queue Management</h3>
                 <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">Awaiting administrative validation</p>
              </div>
              <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-full border border-[#E6E8EA]">
                 <Search size={14} className="text-[#848E9C]" />
                 <input type="text" placeholder="Search trace..." className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-[#1E2026] w-48" />
              </div>
           </div>
           <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-6 bg-white hover:bg-[#F5F5F5] rounded-2xl border border-transparent hover:border-[#E6E8EA] transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1E2026] font-black text-xs border border-[#E6E8EA]">
                         P{i}
                      </div>
                      <div>
                         <p className="text-[14px] font-black text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors">Personnel Identity Sync: 0x{i}A92</p>
                         <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-tighter flex items-center gap-3 mt-1">
                            <Clock size={12} />
                            Cycle Initiated 2h ago
                         </p>
                      </div>
                   </div>
                   <button className="px-6 py-2 bg-[#1E2026] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Process Logic</button>
                </div>
              ))}
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#222126] rounded-3xl p-10 text-white relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
              <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-10 text-[#848E9C] flex items-center gap-2">
                 <Activity size={18} className="text-[#F0B90B]" />
                 Pulse Intelligence
              </h4>
             <div className="space-y-10">
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                       <span className="text-[#848E9C]">Onboarding Flow</span>
                       <span className="text-[#F0B90B]">82% SYNC</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-[#F0B90B]" style={{ width: '82%' }}></div>
                    </div>
                 </div>
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black text-[#848E9C] uppercase mb-1">Global Sentiment</p>
                    <p className="text-xl font-black text-white">Positive Matrix</p>
                 </div>
              </div>
           </div>

           <button className="w-full py-6 bg-white border border-[#E6E8EA] rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026] hover:border-[#F0B90B] hover:text-[#F0B90B] transition-all flex items-center justify-center gap-3 group">
              Audit Personnel Vault
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
