import React from 'react';
import { BarChart3, LineChart, Download, Plus, Filter, FileText, TrendingUp, AlertCircle, Share2, MoreVertical, Wallet } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Reports & <span className="text-[#F0B90B]">Analytics</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Analytical Intelligence Hub
          </p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-3 bg-[#F5F5F5] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#E6E8EA] transition-all flex items-center gap-2">
              <BarChart3 size={16} />
              Monthly Sync
           </button>
           <button className="px-8 py-3 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#FFD000] transition-all shadow-lg flex items-center gap-2">
              <Plus size={16} />
              Generate Trace
           </button>
        </div>
      </div>

      {/* ANALYTICAL HUB MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#F5F5F5] border border-[#E6E8EA] rounded-3xl p-10 relative overflow-hidden group">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-1">Personnel Retention Index</h3>
                 <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">Comparative multi-cycle analytics</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#F0B90B]"></div>
                    <span className="text-[9px] font-black uppercase text-[#848E9C]">Current Sync</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#1E2026]/10"></div>
                    <span className="text-[9px] font-black uppercase text-[#848E9C]">Past Cycle</span>
                 </div>
              </div>
           </div>
           
           <div className="h-56 flex items-end justify-between gap-4 px-4 overflow-hidden">
             {[85, 72, 94, 88, 76, 91].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                   <div className="w-full bg-[#1E2026]/5 rounded-t-xl relative h-full overflow-hidden shadow-inner">
                      <div className="absolute bottom-0 w-full bg-[#1E2026]/5 rounded-t-xl transition-all duration-700" style={{ height: `${h - 15}%` }}></div>
                      <div className="absolute bottom-0 w-full bg-[#F0B90B] rounded-t-xl shadow-lg transition-all duration-1000 group-hover:scale-y-105 origin-bottom" style={{ height: `${h}%` }}></div>
                   </div>
                   <span className="text-[10px] font-black text-[#848E9C] group-hover:text-[#1E2026] uppercase tracking-widest transition-colors font-mono">{['J', 'F', 'M', 'A', 'M', 'J'][i]}</span>
                </div>
             ))}
           </div>
        </div>

        <div className="bg-[#1E2026] rounded-3xl p-10 flex flex-col justify-between text-white relative overflow-hidden group shadow-xl">
           <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
           <div className="relative z-10">
              <TrendingUp size={32} className="text-[#F0B90B] mb-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 text-[#F0B90B]">Turnover Matrix</h4>
              <p className="text-[#848E9C] text-[11px] font-bold leading-relaxed uppercase tracking-tight opacity-80">
                 Efficiency increased by 2.4% following the last structural optimization sync.
              </p>
           </div>
           <div className="relative z-10 pt-10 border-t border-white/5 flex items-baseline gap-3">
              <span className="text-5xl font-black tabular-nums tracking-tighter">4.8%</span>
              <span className="text-[#0ECB81] font-black text-[10px] uppercase tracking-widest px-3 py-1 bg-[#0ECB81]/10 rounded-full">Low Trace</span>
           </div>
        </div>
      </div>

      {/* EXPORT PROTOCOL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Attendance Trace', desc: 'Daily synchronization, latency audits, and hub activity.', icon: Share2 },
          { title: 'Leave Utilization', desc: 'Protocol sickness, vacation, and balance cycle analysis.', icon: FileText },
          { title: 'Payroll Ledger', desc: 'Financial disbursement cost matrix and compliance logs.', icon: Wallet }
        ].map((card, i) => (
          <div key={i} className="bg-white border border-[#E6E8EA] rounded-2xl p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group">
             <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-[#F5F5F5] rounded-xl text-[#1E2026] group-hover:bg-[#F0B90B] transition-all">
                   <card.icon size={20} strokeWidth={2.5} />
                </div>
                <MoreVertical size={18} className="text-[#848E9C] cursor-pointer" />
             </div>
             <h4 className="font-black text-[14px] uppercase tracking-widest text-[#1E2026] mb-2">{card.title}</h4>
             <p className="text-[11px] text-[#848E9C] font-bold mb-10 leading-relaxed uppercase tracking-tight">{card.desc}</p>
             <button className="w-full py-4 bg-[#1E2026] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2">
                <Download size={14} />
                Generate Trace
             </button>
          </div>
        ))}
      </div>

      {/* SCHEDULED REPORT MATRIX */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex justify-between items-center">
           <div>
              <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-1">Automated Pulse Distributions</h3>
              <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-[0.1em]">Active stakeholders scheduled for report delivery</p>
           </div>
           <button className="px-6 py-2 bg-white text-[#1E2026] border border-[#E6E8EA] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#F0B90B] transition-all">Audit Schedule</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Protocol Architect</th>
                <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Cycle Frequency</th>
                <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Target Node</th>
                <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest text-right">Ops Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {[
                { name: 'Monthly Headcount Variance', freq: '1st OF Cycle', next: 'Nov 1, 2024', status: 'Synchronized', color: 'text-[#0ECB81]' },
                { name: 'Performance Cycle Sync', freq: 'Quarterly Pulse', next: 'Dec 31, 2024', status: 'Synchronized', color: 'text-[#0ECB81]' },
                { name: 'Overtime Logic Violation', freq: 'Weekly Trace', next: 'Oct 28, 2024', status: 'Paused (Idle)', color: 'text-[#848E9C]' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group cursor-default">
                  <td className="px-10 py-6">
                     <span className="font-black text-[13px] text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors">{row.name}</span>
                  </td>
                  <td className="px-10 py-6 text-[11px] font-bold text-[#848E9C] uppercase tracking-widest">{row.freq}</td>
                  <td className="px-10 py-6 text-[12px] font-black text-[#1E2026] uppercase">{row.next}</td>
                  <td className="px-10 py-6 text-right">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white border border-[#E6E8EA] ${row.color}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
