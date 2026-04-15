import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Play, Download, TrendingUp, CheckCircle, Clock, ShieldCheck, Activity, Search } from 'lucide-react';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/payroll', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayroll(res.data || []);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const totalCost = payroll.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Payroll & <span className="text-[#F0B90B]">Ledger</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Financial Disbursement Protocols
          </p>
        </div>
        <button className="bg-[#F0B90B] text-[#1E2026] px-10 py-4 rounded-full font-black text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#FFD000] transition-all flex items-center gap-3">
          <Play size={18} fill="currentColor" />
          Initialize Cycle
        </button>
      </div>

      {/* FINANCIAL GRID */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-[#222126] rounded-3xl p-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F0B90B]/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em] mb-3">Aggregate Cost Index (MTD)</p>
                    <h3 className="text-5xl font-black text-white tabular-nums leading-none tracking-tighter">
                       ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                 </div>
                 <div className="flex items-center gap-2 bg-[#F0B90B]/10 text-[#F0B90B] px-4 py-2 rounded-full border border-[#F0B90B]/20">
                    <TrendingUp size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">+4.2% Trace</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Personnel Base', val: `$${(totalCost * 0.75).toLocaleString()}`, icon: Wallet },
                   { label: 'Tax Protocols', val: `$${(totalCost * 0.20).toLocaleString()}`, icon: ShieldCheck },
                   { label: 'Bonus Nodes', val: `$${(totalCost * 0.05).toLocaleString()}`, icon: Activity }
                 ].map((box, i) => (
                   <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                      <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest mb-3">{box.label}</p>
                      <p className="text-xl font-black text-white tabular-nums">{box.val}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white border border-[#E6E8EA] rounded-3xl p-10 flex flex-col justify-between">
           <div>
              <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <Clock size={18} className="text-[#F0B90B]" />
                 Execution Pulse
              </h3>
              <div className="space-y-6">
                 {[
                   { task: 'Time-Log Verification', done: true },
                   { task: 'Audit Trail Validation', done: true },
                   { task: 'Liquidity Distribution', done: false }
                 ].map((node, idx) => (
                   <div key={idx} className="flex items-center justify-between">
                      <p className={`text-[11px] font-black uppercase tracking-widest ${node.done ? 'text-[#848E9C] line-through' : 'text-[#1E2026]'}`}>{node.task}</p>
                      {node.done ? <CheckCircle size={16} className="text-[#0ECB81]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] animate-ping"></div>}
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-12 pt-8 border-t border-[#E6E8EA]">
              <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest mb-2">Protocol Pay Day</p>
              <h4 className="text-2xl font-black text-[#1E2026] uppercase tracking-tight">Sept 30, 2024</h4>
           </div>
        </div>
      </div>

      {/* LEDGER HISTORY */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex justify-between items-center">
           <h3 className="text-[12px] font-black uppercase tracking-widest text-[#1E2026]">Ledger Audit Trail</h3>
           <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-full border border-[#E6E8EA] focus-within:border-[#F0B90B] transition-all w-72 shadow-sm">
              <Search size={14} className="text-[#848E9C]" />
              <input type="text" placeholder="Search trace..." className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-[#1E2026] w-full" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-[#E6E8EA]">
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Cycle Period</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Unit Count</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Aggregate Net</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Sync State</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">Tracing Financial Logs...</td></tr>
              ) : payroll.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">No financial traces detected</td></tr>
              ) : (
                payroll.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group">
                    <td className="px-10 py-6 text-[13px] font-black text-[#1E2026] uppercase tabular-nums">Month Cycle {row.month}</td>
                    <td className="px-10 py-6 text-[12px] font-bold text-[#848E9C] uppercase tracking-widest">Personnel {i+1}</td>
                    <td className="px-10 py-6 text-[14px] font-black text-[#1E2026] tabular-nums">${row.netSalary?.toLocaleString()}</td>
                    <td className="px-10 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         row.paymentStatus === 'Paid' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F0B90B]/10 text-[#D0980B]'
                       }`}>
                         {row.paymentStatus}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button className="p-2 text-[#848E9C] hover:text-[#1E2026] transition-colors"><Download size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
