import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Send, Activity, ShieldAlert, ArrowUpRight, Clock, User, FileText } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leaveType: 'Sick',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      // Let's assume the backend routes allow getting ALL leaves, but here we filter or ideally have a /my-leaves endpoint.
      // For now we'll fetch all and filter by user ID, or rely on the backend strictly returning user leaves if role=employee.
      const response = await axios.get('http://localhost:5000/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Safety filter if backend returns all
      const myLeaves = response.data.filter(l => l.employeeId?._id === user._id || l.employeeId === user._id);
      setLeaves(myLeaves);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const days = calculateDays(formData.startDate, formData.endDate);
      await axios.post('http://localhost:5000/api/leaves', { ...formData, totalDays: days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyLeaves();
      setFormData({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Leave <span className="text-[#F0B90B]">Protocols</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Personal Time-Off Matrix
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* REQUEST FORM */}
        <div className="col-span-12 lg:col-span-5 bg-[#222126] rounded-3xl p-10 text-white relative overflow-hidden group shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F0B90B]/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
           
           <div className="relative z-10 mb-10 pb-6 border-b border-white/10">
              <h3 className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                 <Send size={18} className="text-[#F0B90B]" />
                 Transmit Leave Logic
              </h3>
           </div>

           <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Leave Designation</label>
                 <select 
                   value={formData.leaveType}
                   onChange={e => setFormData({...formData, leaveType: e.target.value})}
                   className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold focus:outline-none focus:border-[#F0B90B] transition-colors"
                 >
                    <option value="Sick" className="bg-[#222126]">Sick Trace</option>
                    <option value="Casual" className="bg-[#222126]">Casual Pause</option>
                    <option value="Annual" className="bg-[#222126]">Annual Refresh</option>
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Start Cycle</label>
                    <input 
                      type="date" 
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold focus:outline-none focus:border-[#F0B90B]"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">End Cycle</label>
                    <input 
                      type="date" 
                      required
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold focus:outline-none focus:border-[#F0B90B]"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Justification Matrix</label>
                 <textarea 
                   required
                   value={formData.reason}
                   onChange={e => setFormData({...formData, reason: e.target.value})}
                   placeholder="Enter required context..."
                   className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold focus:outline-none focus:border-[#F0B90B] min-h-[100px] resize-none"
                 />
              </div>

              <button type="submit" className="w-full py-4 mt-4 bg-[#F0B90B] text-[#1E2026] rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#FFD000] active:scale-95 transition-all shadow-[0_0_15px_rgba(240,185,11,0.2)]">
                 Transmit Request
              </button>
           </form>
        </div>

        {/* LOG HISTORY */}
        <div className="col-span-12 lg:col-span-7 space-y-8 flex flex-col">
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 border border-[#E6E8EA] rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#F0B90B]/10 rounded-bl-full -mt-4 -mr-4 group-hover:scale-125 transition-transform"></div>
                 <h3 className="text-4xl font-black text-[#1E2026] tabular-nums">{pendingLeaves}</h3>
                 <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em] mt-1">Awaiting Validation</p>
              </div>
              <div className="bg-white p-8 border border-[#E6E8EA] rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#0ECB81]/10 rounded-bl-full -mt-4 -mr-4 group-hover:scale-125 transition-transform"></div>
                 <h3 className="text-4xl font-black text-[#1E2026] tabular-nums">{approvedLeaves}</h3>
                 <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em] mt-1">Cycles Authorized</p>
              </div>
           </div>

           <div className="bg-white border border-[#E6E8EA] rounded-3xl flex-1 flex flex-col overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
              <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                 <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E2026]">Personal Trace History</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-[#E6E8EA]">
                        <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Protocol</th>
                        <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Window</th>
                        <th className="px-8 py-5 text-[10px] font-black text-[#848E9C] uppercase tracking-widest text-right">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E8EA]">
                       {loading ? (
                         <tr><td colSpan="3" className="py-12 text-center text-[10px] text-[#848E9C] font-black uppercase">Syncing...</td></tr>
                       ) : leaves.length === 0 ? (
                         <tr><td colSpan="3" className="py-12 text-center text-[10px] text-[#848E9C] font-black uppercase">No protocols found</td></tr>
                       ) : leaves.map((lv, i) => (
                         <tr key={i} className="hover:bg-[#F5F5F5] transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white border border-[#E6E8EA] flex items-center justify-center text-[#1E2026]">
                                     <FileText size={12} />
                                  </div>
                                  <span className="text-[12px] font-bold text-[#1E2026] uppercase">{lv.leaveType}</span>
                               </div>
                            </td>
                            <td className="px-8 py-5">
                               <span className="text-[12px] font-black text-[#1E2026] tabular-nums">{new Date(lv.startDate).toLocaleDateString()}</span>
                               <span className="text-[10px] font-bold text-[#848E9C] uppercase ml-2 tabular-nums">({lv.totalDays}d)</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 lv.status === 'Approved' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 
                                 lv.status === 'Rejected' ? 'bg-[#F6465D]/10 text-[#F6465D]' : 
                                 'bg-[#F0B90B]/10 text-[#D0980B] animate-pulse'
                               }`}>
                                 {lv.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
