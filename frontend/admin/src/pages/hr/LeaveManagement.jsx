import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, XCircle, Calendar, Users, Filter, Search, MoreHorizontal, User, ArrowUpRight } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data || []);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Connection to Leave Protocol node disrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Leave <span className="text-[#F0B90B]">Protocol</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Organizational Leave Management Node
          </p>
        </div>
        <button className="bg-[#F0B90B] text-[#1E2026] px-10 py-4 rounded-full font-black text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#FFD000] transition-all flex items-center gap-3">
          <Calendar size={18} />
          Adjust Policies
        </button>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 bg-white border border-[#E6E8EA] rounded-2xl p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-all group overflow-hidden relative">
           <div className="p-3 w-12 h-12 bg-[#F5F5F5] rounded-xl text-[#F0B90B] mb-8 group-hover:bg-[#F0B90B] group-hover:text-white transition-all">
              <Users size={24} />
           </div>
           <h3 className="text-2xl font-black text-[#1E2026] tabular-nums mb-1">98%</h3>
           <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em]">Presence Pulse</p>
           <div className="mt-6 w-full bg-[#F5F5F5] rounded-full h-1">
              <div className="bg-[#0ECB81] h-full rounded-full transition-all duration-1000" style={{ width: '98%' }}></div>
           </div>
        </div>

        <div className="md:col-span-1 bg-white border border-[#E6E8EA] rounded-2xl p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-all group overflow-hidden relative">
           <div className={`p-3 w-12 h-12 rounded-xl mb-8 transition-all ${pendingCount > 0 ? 'bg-[#F0B90B]/10 text-[#F0B90B]' : 'bg-[#F5F5F5] text-[#848E9C]'}`}>
              <ShieldAlert size={24} />
           </div>
           <h3 className="text-2xl font-black text-[#1E2026] tabular-nums mb-1">{pendingCount}</h3>
           <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em]">Pending Nodes</p>
           <p className={`mt-6 text-[9px] font-black uppercase tracking-widest ${pendingCount > 0 ? 'text-[#F0B90B] animate-pulse' : 'text-[#848E9C]'}`}>
              {pendingCount > 0 ? 'Immediate Action' : 'System Synchronized'}
           </p>
        </div>

        <div className="md:col-span-2 bg-[#222126] text-white p-8 rounded-3xl relative overflow-hidden group shadow-xl">
           <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
           <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                 <h4 className="text-xl font-black mb-2">Organizational Quota Trace</h4>
                 <p className="text-[#848E9C] text-[11px] font-bold leading-relaxed uppercase tracking-widest mb-6">Standard cycle set to 24 units per personnel node.</p>
              </div>
              <button className="text-[#F0B90B] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                 Modify Global Protocol <ArrowUpRight size={14} />
              </button>
           </div>
           <Calendar size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
        </div>
      </div>

      {/* REQUEST TABLE */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026]">Personnel Request Matrix</h3>
           <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-full border border-[#E6E8EA] focus-within:border-[#F0B90B] transition-all w-72 shadow-sm">
              <Search size={14} className="text-[#848E9C]" />
              <input type="text" placeholder="Search trace..." className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-[#1E2026] w-full" />
           </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-30">
             <div className="w-10 h-10 border-2 border-t-[#F0B90B] border-[#F5F5F5] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">Tracing Matrix...</p>
          </div>
        ) : error ? (
           <div className="py-32 text-center text-[#F6465D] font-black uppercase tracking-widest text-[11px]">{error}</div>
        ) : leaves.length === 0 ? (
           <div className="py-32 text-center text-[#848E9C] font-black uppercase tracking-widest text-[11px]">Matrix queue empty</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                  <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Node</th>
                  <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Type</th>
                  <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Cycle Window</th>
                  <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Status Trace</th>
                  <th className="px-10 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest text-right">Ops Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8EA]">
                {leaves.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group cursor-default">
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1E2026] border border-[#E6E8EA] font-black text-xs">
                             <User size={16} className="text-[#F0B90B]" />
                          </div>
                          <div>
                             <p className="text-[13px] font-black text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors">
                                {row.employeeId?.profile?.firstName} {row.employeeId?.profile?.lastName}
                             </p>
                             <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mt-1">
                                {row.employeeId?.email}
                             </p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="px-4 py-1.5 bg-[#F5F5F5] rounded-full text-[10px] font-black uppercase tracking-widest text-[#1E2026]">
                          {row.leaveType}
                       </span>
                    </td>
                    <td className="px-10 py-6">
                       <p className="text-[13px] font-black text-[#1E2026] tabular-nums uppercase">
                          {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                       </p>
                       <p className="text-[10px] font-bold text-[#F0B90B] uppercase tracking-widest mt-1">{row.totalDays} Units</p>
                    </td>
                    <td className="px-10 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         row.status === 'Approved' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 
                         row.status === 'Rejected' ? 'bg-[#F6465D]/10 text-[#F6465D]' : 
                         'bg-[#F0B90B]/10 text-[#D0980B] animate-pulse'
                       }`}>
                         {row.status}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          {row.status === 'Pending' && (
                            <>
                              <button onClick={() => handleStatusUpdate(row._id, 'Approved')} className="p-2.5 rounded-lg bg-[#0ECB81]/10 text-[#0ECB81] hover:bg-[#0ECB81] hover:text-white transition-all shadow-sm shadow-[#0ECB81]/10">
                                 <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleStatusUpdate(row._id, 'Rejected')} className="p-2.5 rounded-lg bg-[#F6465D]/10 text-[#F6465D] hover:bg-[#F6465D] hover:text-white transition-all shadow-sm shadow-[#F6465D]/10">
                                 <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button className="p-2.5 text-[#848E9C] hover:text-[#1E2026]"><MoreHorizontal size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
