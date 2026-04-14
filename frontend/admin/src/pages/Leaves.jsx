import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, MoreHorizontal, User } from 'lucide-react';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaves', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaves(res.data || []);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Leave <span className="text-[#F0B90B]">Management</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Protocol Scheduling Node
          </p>
        </div>
        <button className="bg-[#F0B90B] text-[#1E2026] px-10 py-4 rounded-full font-black text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#FFD000] transition-all flex items-center gap-2">
          <Calendar size={18} />
          Adjust Policies
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Requests', val: leaves.filter(l => l.status === 'Pending').length, cap: 'Immediate Action', color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
          { label: 'Currently On Leave', val: leaves.filter(l => l.status === 'Approved').length, cap: 'Capacity: 92%', color: 'text-[#1EAEDB]', bg: 'bg-[#1EAEDB]/10' },
          { label: 'System Denials', val: leaves.filter(l => l.status === 'Rejected').length, cap: 'Policy Constraints', color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all">
             <div className="flex justify-between items-start mb-10">
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color} px-4 py-1.5 rounded-full ${stat.bg}`}>{stat.label}</span>
                <Clock size={18} className="text-[#848E9C]" />
             </div>
             <div className="text-left">
                <h3 className="text-4xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-[0.1em]">{stat.cap}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex justify-between items-center">
           <h3 className="text-[14px] font-black uppercase tracking-widest text-[#1E2026]">Protocol Request History</h3>
           <div className="flex gap-4">
              <span className="text-[11px] font-black text-[#848E9C] uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-[#E6E8EA]">All Segments</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-[#E6E8EA]">
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Node</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Type</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Duration Cycle</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Status Trace</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest text-right">Ops Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">Querying Leave Matrix...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-32 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]">No scheduling logs detected</td></tr>
              ) : (
                leaves.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1E2026] border border-[#E6E8EA] font-black text-xs">
                           <User size={16} className="text-[#F0B90B]" />
                        </div>
                        <span className="text-[13px] font-black text-[#1E2026]">
                           {row.employeeId?.profile?.firstName} {row.employeeId?.profile?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[12px] font-bold text-[#1E2026] uppercase tracking-widest">{row.leaveType}</td>
                    <td className="px-10 py-6">
                       <p className="text-[13px] font-black text-[#1E2026] tabular-nums">{row.startDate} - {row.endDate}</p>
                       <p className="text-[11px] font-bold text-[#848E9C]">{row.totalDays} Days</p>
                    </td>
                    <td className="px-10 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         row.status === 'Approved' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 
                         row.status === 'Rejected' ? 'bg-[#F6465D]/10 text-[#F6465D]' : 
                         'bg-[#F0B90B]/10 text-[#D0980B]'
                       }`}>
                         {row.status}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          {row.status === 'Pending' && (
                            <>
                              <button onClick={() => handleAction(row._id, 'Approved')} className="p-2.5 rounded-lg bg-[#0ECB81]/10 text-[#0ECB81] hover:bg-[#0ECB81] hover:text-white transition-all"><CheckCircle size={16} /></button>
                              <button onClick={() => handleAction(row._id, 'Rejected')} className="p-2.5 rounded-lg bg-[#F6465D]/10 text-[#F6465D] hover:bg-[#F6465D] hover:text-white transition-all"><XCircle size={16} /></button>
                            </>
                          )}
                          <button className="p-2.5 text-[#848E9C] hover:text-[#1E2026]"><MoreHorizontal size={18} /></button>
                       </div>
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

export default Leaves;
