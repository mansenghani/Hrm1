import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Play, Download, TrendingUp, CheckCircle, Clock, ShieldCheck, Activity, Search, RefreshCw } from 'lucide-react';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem('token');

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      // Using relative path for proxy support
      const res = await axios.get('/api/payroll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayroll(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const totalCost = payroll.reduce((acc, p) => acc + (p?.netSalary || 0), 0);

  return (
    <div className="animate-fade-in pb-32">
      
      {/* HEADER */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Financial Protocols</p>
          <h1 className="zap-display-hero">Payroll & <span className="text-[#ff4f00]">Ledger.</span></h1>
        </div>
        <button className="zap-btn zap-btn-orange h-14 px-8">
          <Play size={18} className="mr-3" />
          Initialize Cycle
        </button>
      </div>

      {/* FINANCIAL GRID - Zapier Style */}
      <div className="grid grid-cols-12 gap-12 mb-16">
        <div className="col-span-12 lg:col-span-8 zap-card bg-[#201515] text-[#fffefb] p-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4f00]/10 blur-3xl rounded-full"></div>
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-16">
                 <div>
                    <p className="zap-caption-upper !text-[#939084] mb-4">Aggregate Cost Index (MTD)</p>
                    <h3 className="text-[64px] font-medium tabular-nums leading-none tracking-tighter">
                       ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                 </div>
                 <div className="flex items-center gap-2 bg-[#ff4f00]/10 text-[#ff4f00] px-5 py-2 rounded-full border border-[#ff4f00]/20">
                    <TrendingUp size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">+4.2% Sync</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Personnel Base', val: `$${(totalCost * 0.75).toLocaleString()}`, icon: Wallet },
                   { label: 'Tax Protocols', val: `$${(totalCost * 0.20).toLocaleString()}`, icon: ShieldCheck },
                   { label: 'Bonus Nodes', val: `$${(totalCost * 0.05).toLocaleString()}`, icon: Activity }
                 ].map((box, i) => (
                   <div key={i} className="p-6 bg-white/5 rounded-[8px] border border-white/5 hover:bg-white/10 transition-all">
                      <p className="text-[11px] font-bold text-[#939084] uppercase tracking-widest mb-3">{box.label}</p>
                      <p className="text-[20px] font-medium text-[#fffefb] tabular-nums">{box.val}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 zap-card bg-[#fffdf9] p-10 flex flex-col justify-between">
           <div>
              <h3 className="zap-caption-upper text-[#201515] mb-10 flex items-center gap-3">
                 <Clock size={18} className="text-[#ff4f00]" />
                 Execution Pulse
              </h3>
              <div className="space-y-6">
                 {[
                   { task: 'Time-Log Verification', done: true },
                   { task: 'Audit Trail Validation', done: true },
                   { task: 'Liquidity Distribution', done: false }
                 ].map((node, idx) => (
                   <div key={idx} className="flex items-center justify-between border-b border-[#c5c0b1] pb-4 last:border-none">
                      <p className={`text-[13px] font-bold uppercase tracking-wider ${node.done ? 'text-[#939084] line-through' : 'text-[#201515]'}`}>{node.task}</p>
                      {node.done ? <CheckCircle size={18} className="text-[#24a148]" /> : <div className="w-2 h-2 rounded-full bg-[#ff4f00] animate-pulse"></div>}
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-12 pt-8 border-t border-[#c5c0b1]">
              <p className="zap-caption-upper text-[#939084] mb-3">Protocol Pay Day</p>
              <h4 className="text-[28px] font-medium text-[#201515] uppercase tracking-tight">Sept 30, 2024</h4>
           </div>
        </div>
      </div>

      {/* LEDGER HISTORY - Zapier Border Forward */}
      <div className="zap-card p-0 overflow-hidden">
        <div className="p-8 border-b border-[#c5c0b1] bg-[#fffdf9] flex justify-between items-center">
           <h3 className="text-[14px] font-black uppercase tracking-widest text-[#201515]">Ledger Audit Trail</h3>
           <div className="flex items-center gap-4 bg-white px-6 h-12 rounded-[4px] border border-[#c5c0b1] focus-within:border-[#ff4f00] transition-all w-72">
              <Search size={18} className="text-[#939084]" />
              <input type="text" placeholder="Search trace..." className="bg-transparent border-none focus:outline-none text-[14px] font-medium text-[#201515] w-full" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Cycle Period</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Unit Count</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Aggregate Net</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Sync State</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c0b1]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
                    <p className="zap-caption-upper text-[#939084]">Tracing Financial Logs...</p>
                  </div>
                </td></tr>
              ) : payroll.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-24 text-[15px] font-medium text-[#939084]">No financial traces detected</td></tr>
              ) : (
                payroll.map((row, i) => (
                  <tr key={i} className="hover:bg-[#fffdf9] transition-colors group">
                    <td className="px-8 py-6 text-[15px] font-bold text-[#201515] uppercase tabular-nums">Month Cycle {row?.month || 'ERR'}</td>
                    <td className="px-8 py-6 text-[13px] font-bold text-[#939084] uppercase tracking-widest">Personnel {i+1}</td>
                    <td className="px-8 py-6 text-[16px] font-bold text-[#201515] tabular-nums">${row?.netSalary?.toLocaleString() || '0.00'}</td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${
                         row?.paymentStatus === 'Paid' ? 'bg-[#24a148] text-white' : 'bg-[#fffdf9] border border-[#ff4f00] text-[#ff4f00]'
                       }`}>
                         {row?.paymentStatus || 'PENDING'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="w-10 h-10 flex items-center justify-center text-[#ff4f00] hover:bg-[#ff4f00] hover:text-[#fffefb] rounded-[4px] transition-all bg-transparent border-none cursor-pointer"><Download size={20} /></button>
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
