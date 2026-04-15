import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Filter, MoreVertical, CheckCircle, Clock, XCircle, TrendingUp, Search } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/attendance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(res.data || []);
      } catch (err) {
        console.error('Sync failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = attendance.filter(item => {
    const name = `${item.employeeId?.profile?.firstName} ${item.employeeId?.profile?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Real-time <span className="text-[#F0B90B]">Presence</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Workforce Synchronization Matrix
          </p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-3 bg-[#F5F5F5] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#E6E8EA] transition-all flex items-center gap-2">
              <Download size={16} />
              Export CSV
           </button>
           <button className="px-8 py-3 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#FFD000] transition-all shadow-lg flex items-center gap-2">
              <Calendar size={16} />
              Protocol Report
           </button>
        </div>
      </div>

      {/* DATA HUB */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Currently Active', val: attendance.filter(a => !a.clockOut).length, cap: '+4% vs Peak', icon: CheckCircle, color: 'text-[#0ECB81]' },
          { label: 'Late Syncs', val: '12', cap: 'Action Required', icon: Clock, color: 'text-[#F0B90B]' },
          { label: 'Ejected Nodes', val: '8', cap: 'Offline Today', icon: XCircle, color: 'text-[#F6465D]' },
          { label: 'Avg Pulse', val: '08:42', cap: 'Optimal Logic', icon: TrendingUp, color: 'text-[#1EAEDB]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-xl hover:shadow-[0_8px_24px_rgba(32,32,37,0.05)] transition-all group">
             <div className="flex justify-between items-start mb-10">
                <div className={`p-2.5 rounded-lg bg-[#F5F5F5] ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] font-bold px-3 py-1 bg-[#F5F5F5] rounded-full">{stat.cap}</span>
             </div>
             <div className="text-left">
                <h3 className="text-3xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-[0.15em]">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* PRESENCE MATRIX */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#E6E8EA] focus-within:border-[#F0B90B] transition-all w-full md:w-96 shadow-sm">
              <Search size={18} className="text-[#848E9C]" />
              <input 
                type="text" 
                placeholder="Find presence by node name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-[#1E2026] placeholder:text-[#848E9C] w-full"
              />
           </div>
           <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-lg text-[#848E9C] hover:bg-white hover:text-[#1E2026] border border-transparent hover:border-[#E6E8EA] transition-all">
                 <Filter size={18} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-[#E6E8EA]">
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Unit</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Sync Cycle (Date)</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Check-In Trace</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Check-Out Trace</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest text-right">Operational State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">Querying Presence Hub...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">No presence logs recorded in this segment</td></tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1E2026] border border-[#E6E8EA] font-black text-xs uppercase">
                           {row.employeeId?.profile?.firstName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-[13px] font-black text-[#1E2026] truncate max-w-[150px]">
                           {row.employeeId?.profile?.firstName} {row.employeeId?.profile?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[12px] font-bold text-[#848E9C] tabular-nums">{row.date}</td>
                    <td className="px-10 py-6">
                       <span className="text-[14px] font-black text-[#1E2026] tabular-nums">{row.clockIn || '--:--'}</span>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-[12px] font-bold text-[#848E9C] tabular-nums">{row.clockOut || '--:--'}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         row.clockOut ? 'bg-[#F5F5F5] text-[#848E9C]' : 'bg-[#0ECB81]/10 text-[#0ECB81]'
                       }`}>
                         {row.clockOut ? 'Finalized' : 'Node Active'}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-[#F5F5F5]/50 px-10 py-6 border-t border-[#E6E8EA] text-center">
           <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-[0.4em] scale-x-110 italic">Core Synchronization Integrity: High Operation Path</p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
