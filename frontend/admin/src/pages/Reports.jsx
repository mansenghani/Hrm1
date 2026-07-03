import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, Download, Plus, Filter, FileText, TrendingUp, AlertCircle, Share2, MoreVertical, Wallet, Calendar, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';

const Reports = () => {
   const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
   const [activeTab, setActiveTab] = useState('overview'); // overview, personnel, financial, security
   const [selectedRange, setSelectedRange] = useState('This Month');
   const [isRangeOpen, setIsRangeOpen] = useState(false);

   // Sync theme status reactively
   useEffect(() => {
      const observer = new MutationObserver(() => {
         setIsDark(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
   }, []);

   const dateRanges = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h1 className="text-4xl font-black text-[#1E2026] dark:text-white tracking-tight leading-none mb-3">
                  Reports & <span className="text-[#F0B90B]">Analytics</span>
               </h1>
               <p className="text-[#848E9C] dark:text-[#a3a094] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
                  Analytical Intelligence Hub
               </p>
            </div>
            
            {/* Header Controls */}
            <div className="flex flex-wrap items-center gap-4 z-30">
               {/* Timeframe Dropdown */}
               <div className="relative">
                  <button 
                     onClick={() => setIsRangeOpen(!isRangeOpen)}
                     className="px-6 py-3 bg-[#F5F5F5] dark:bg-[#282520] text-[#1E2026] dark:text-white border border-transparent dark:border-[#38352e] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#E6E8EA] dark:hover:bg-[#38352e] transition-all flex items-center gap-2 outline-none shadow-sm cursor-pointer"
                  >
                     <Calendar size={14} className="text-[#F0B90B]" />
                     <span>Timeframe: {selectedRange}</span>
                     <ChevronDown size={14} className={`transition-transform duration-200 ${isRangeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRangeOpen && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsRangeOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-scale-up">
                           {dateRanges.map((range) => (
                              <button
                                 key={range}
                                 onClick={() => {
                                    setSelectedRange(range);
                                    setIsRangeOpen(false);
                                 }}
                                 className={`w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                                    selectedRange === range 
                                       ? 'text-[#F0B90B] bg-[#F5F5F5]/50 dark:bg-white/5' 
                                       : 'text-[#1E2026] dark:text-white/70 hover:text-white hover:bg-[#F0B90B] dark:hover:bg-[#F0B90B]'
                                 }`}
                              >
                                 {range}
                              </button>
                           ))}
                        </div>
                     </>
                  )}
               </div>

               <button className="px-6 py-3 bg-[#F5F5F5] dark:bg-[#282520] text-[#1E2026] dark:text-white border border-transparent dark:border-[#38352e] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#E6E8EA] dark:hover:bg-[#38352e] transition-all flex items-center gap-2 shadow-sm">
                  <BarChart3 size={14} className="text-[#F0B90B]" />
                  Monthly Sync
               </button>
               <button className="px-6 py-3 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#FFD000] transition-all shadow-md flex items-center gap-2">
                  <Plus size={14} />
                  Generate Trace
               </button>
            </div>
         </div>

         {/* FILTER TABS */}
         <div className="border-b border-[#E6E8EA] dark:border-[#38352e] flex flex-wrap gap-2 md:gap-6 pb-px">
            {[
               { id: 'overview', name: 'Overview Matrix' },
               { id: 'personnel', name: 'Personnel Logs' },
               { id: 'financial', name: 'Financial Reports' },
               { id: 'security', name: 'Security Audits' },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative outline-none border-none cursor-pointer ${
                     activeTab === tab.id 
                        ? 'text-[#F0B90B]' 
                        : 'text-[#848E9C] hover:text-[#1E2026] dark:hover:text-white'
                  }`}
               >
                  {tab.name}
                  {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B] rounded-full"></div>
                  )}
               </button>
            ))}
         </div>

         {/* ACTIVE TAB VIEWS */}
         {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               {/* ANALYTICAL HUB MATRIX */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#F5F5F5] dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-3xl p-10 relative overflow-hidden group transition-all">
                     <div className="flex justify-between items-center mb-10">
                        <div>
                           <h3 className="text-[12px] font-black text-[#1E2026] dark:text-white uppercase tracking-[0.2em] mb-1">Personnel Retention Index</h3>
                           <p className="text-[10px] font-bold text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest">Comparative multi-cycle analytics</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-[#F0B90B]"></div>
                              <span className="text-[9px] font-black uppercase text-[#848E9C] dark:text-[#a3a094]">Current Sync</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-[#1E2026]/10 dark:bg-white/10"></div>
                              <span className="text-[9px] font-black uppercase text-[#848E9C] dark:text-[#a3a094]">Past Cycle</span>
                           </div>
                        </div>
                     </div>

                     <div className="h-56 flex items-end justify-between gap-4 px-4 overflow-hidden">
                        {[85, 72, 94, 88, 76, 91].map((h, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                              <div className="w-full bg-[#1E2026]/5 dark:bg-white/5 rounded-t-xl relative h-full overflow-hidden shadow-inner">
                                 <div className="absolute bottom-0 w-full bg-[#1E2026]/5 dark:bg-white/10 rounded-t-xl transition-all duration-700" style={{ height: `${h - 15}%` }}></div>
                                 <div className="absolute bottom-0 w-full bg-[#F0B90B] rounded-t-xl shadow-lg transition-all duration-1000 group-hover:scale-y-105 origin-bottom" style={{ height: `${h}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-[#848E9C] dark:text-[#a3a094] group-hover:text-[#1E2026] dark:group-hover:text-white uppercase tracking-widest transition-colors font-mono">{['J', 'F', 'M', 'A', 'M', 'J'][i]}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-3xl p-10 flex flex-col justify-between text-[#1E2026] dark:text-white relative overflow-hidden group shadow-sm dark:shadow-xl transition-all">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
                     <div className="relative z-10">
                        <TrendingUp size={32} className="text-[#F0B90B] mb-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 text-[#1E2026] dark:text-[#F0B90B]">Turnover Matrix</h4>
                        <p className="text-[#848E9C] dark:text-[#a3a094] text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                           Efficiency increased by 2.4% following the last structural optimization sync.
                        </p>
                     </div>
                     <div className="relative z-10 pt-10 border-t border-[#E6E8EA] dark:border-white/10 flex items-baseline gap-3">
                        <span className="text-5xl font-black tabular-nums tracking-tighter text-[#1E2026] dark:text-white">4.8%</span>
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
                     <div key={i} className="bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-2xl p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all group">
                        <div className="flex justify-between items-start mb-8">
                           <div className="p-4 bg-[#F5F5F5] dark:bg-[#282520] rounded-xl text-[#1E2026] dark:text-white group-hover:bg-[#F0B90B] dark:group-hover:bg-[#F0B90B] group-hover:text-[#1E2026] transition-all">
                              <card.icon size={20} strokeWidth={2.5} />
                           </div>
                           <MoreVertical size={18} className="text-[#848E9C] dark:text-[#a3a094] cursor-pointer hover:text-[#1E2026] dark:hover:text-white" />
                        </div>
                        <h4 className="font-black text-[14px] uppercase tracking-widest text-[#1E2026] dark:text-white mb-2">{card.title}</h4>
                        <p className="text-[11px] text-[#848E9C] dark:text-[#a3a094] font-bold mb-10 leading-relaxed uppercase tracking-tight">{card.desc}</p>
                        <button className="w-full py-4 bg-[#F5F5F5] dark:bg-[#282520] text-[#1E2026] dark:text-white/80 border border-[#E6E8EA] dark:border-[#38352e] rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#E6E8EA] dark:hover:bg-[#38352e] hover:text-[#F0B90B] dark:hover:text-[#F0B90B] transition-all flex items-center justify-center gap-2">
                           <Download size={14} />
                           Generate Trace
                        </button>
                     </div>
                  ))}
               </div>

               {/* SCHEDULED REPORT MATRIX */}
               <div className="bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
                  <div className="p-8 bg-[#F5F5F5]/30 dark:bg-[#282520]/20 border-b border-[#E6E8EA] dark:border-[#38352e] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h3 className="text-[12px] font-black text-[#1E2026] dark:text-white uppercase tracking-[0.2em] mb-1">Automated Pulse Distributions</h3>
                        <p className="text-[10px] font-bold text-[#848E9C] dark:text-[#a3a094] uppercase tracking-[0.1em]">Active stakeholders scheduled for report delivery</p>
                     </div>
                     <button className="px-6 py-2 bg-white dark:bg-[#282520] text-[#1E2026] dark:text-white border border-[#E6E8EA] dark:border-[#38352e] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#F0B90B] dark:hover:border-[#F0B90B] transition-all">Audit Schedule</button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-[#F5F5F5]/30 dark:bg-[#282520]/10 border-b border-[#E6E8EA] dark:border-[#38352e]">
                              <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest">Protocol Architect</th>
                              <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest">Cycle Frequency</th>
                              <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest">Target Node</th>
                              <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest text-right">Ops Logic</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E8EA] dark:divide-[#38352e]">
                           {[
                              { name: 'Monthly Headcount Variance', freq: '1st OF Cycle', next: 'Nov 1, 2024', status: 'Synchronized', color: 'text-[#0ECB81]' },
                              { name: 'Performance Cycle Sync', freq: 'Quarterly Pulse', next: 'Dec 31, 2024', status: 'Synchronized', color: 'text-[#0ECB81]' },
                              { name: 'Overtime Logic Violation', freq: 'Weekly Trace', next: 'Oct 28, 2024', status: 'Paused (Idle)', color: 'text-[#848E9C] dark:text-[#a3a094]' }
                           ].map((row, i) => (
                              <tr key={i} className="hover:bg-[#F5F5F5] dark:hover:bg-[#282520]/30 transition-colors group cursor-default">
                                 <td className="px-10 py-6">
                                    <span className="font-black text-[13px] text-[#1E2026] dark:text-white uppercase group-hover:text-[#F0B90B] transition-colors">{row.name}</span>
                                 </td>
                                 <td className="px-10 py-6 text-[11px] font-bold text-[#848E9C] dark:text-[#a3a094] uppercase tracking-widest">{row.freq}</td>
                                 <td className="px-10 py-6 text-[12px] font-black text-[#1E2026] dark:text-white uppercase">{row.next}</td>
                                 <td className="px-10 py-6 text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white dark:bg-[#282520] border border-[#E6E8EA] dark:border-[#38352e] ${row.color}`}>{row.status}</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'personnel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
               {[
                  { name: 'Headcount & Turnover History', items: 12, size: '2.4 MB' },
                  { name: 'Attendance & Timelogs Master', items: 154, size: '14.8 MB' },
                  { name: 'Leave Allocations Sync Report', items: 45, size: '3.1 MB' },
                  { name: 'Manager Overtime Logic Audit', items: 8, size: '840 KB' }
               ].map((doc, i) => (
                  <div key={i} className="bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-2xl p-8 flex items-center justify-between group hover:border-[#F0B90B] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#F5F5F5] dark:bg-[#282520] text-[#1E2026] dark:text-[#F0B90B] rounded-xl">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h4 className="font-black text-[13px] text-[#1E2026] dark:text-white uppercase tracking-wider mb-1">{doc.name}</h4>
                           <p className="text-[10px] text-[#848E9C] dark:text-[#a3a094] font-bold uppercase tracking-widest">{doc.items} Records &bull; {doc.size}</p>
                        </div>
                     </div>
                     <button className="p-3 bg-[#F5F5F5] dark:bg-[#282520] hover:bg-[#F0B90B] dark:hover:bg-[#F0B90B] hover:text-[#1E2026] dark:hover:text-[#1E2026] text-[#1E2026] dark:text-white rounded-xl transition-all">
                        <Download size={16} />
                     </button>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
               {[
                  { name: 'Payroll Ledger Master (Q2)', items: 'Active Cycle', size: '24.1 MB' },
                  { name: 'Disbursement Reconciliation Log', items: 'Reconciled', size: '8.4 MB' },
                  { name: 'Tax Compliance & Ledger Drift', items: 'Archived', size: '1.2 MB' },
                  { name: 'Bonus & Equity Grant Allocation', items: 'Pending Review', size: '512 KB' }
               ].map((doc, i) => (
                  <div key={i} className="bg-white dark:bg-[#181612] border border-[#E6E8EA] dark:border-[#38352e] rounded-2xl p-8 flex items-center justify-between group hover:border-[#F0B90B] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#F5F5F5] dark:bg-[#282520] text-[#1E2026] dark:text-[#F0B90B] rounded-xl">
                           <Wallet size={20} />
                        </div>
                        <div>
                           <h4 className="font-black text-[13px] text-[#1E2026] dark:text-white uppercase tracking-wider mb-1">{doc.name}</h4>
                           <p className="text-[10px] text-[#848E9C] dark:text-[#a3a094] font-bold uppercase tracking-widest">{doc.items} &bull; {doc.size}</p>
                        </div>
                     </div>
                     <button className="p-3 bg-[#F5F5F5] dark:bg-[#282520] hover:bg-[#F0B90B] dark:hover:bg-[#F0B90B] hover:text-[#1E2026] dark:hover:text-[#1E2026] text-[#1E2026] dark:text-white rounded-xl transition-all">
                        <Download size={16} />
                     </button>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
               {/* Illustrated Empty State */}
               <div className={`border rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all ${
                  isDark ? 'bg-[#181612] border-[#38352e]' : 'bg-[#F5F5F5] border-[#E6E8EA]'
               }`}>
                  <div className={`p-6 rounded-full mb-6 ${isDark ? 'bg-[#282520] text-white' : 'bg-white text-[#1E2026]'} shadow-md`}>
                     <CheckCircle2 size={40} className="text-[#0ECB81] animate-bounce" />
                  </div>
                  <h3 className={`text-lg font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white' : 'text-[#1E2026]'}`}>No Security Anomalies</h3>
                  <p className={`text-[11px] font-bold max-w-md uppercase tracking-widest leading-relaxed mb-8 ${isDark ? 'text-[#a3a094]' : 'text-[#848E9C]'}`}>
                     The operational network is currently synchronized. No latency drifts, unauthorized actions, or log leaks have been detected in the current session.
                  </p>
                  <button className="px-8 py-4 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD000] hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2">
                     <Plus size={12} />
                     Trigger Pulse Check
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default Reports;
