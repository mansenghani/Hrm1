import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Send, Activity, ShieldAlert, ArrowUpRight, Clock, User, 
  FileText, ChevronDown, HeartPulse, Zap, Briefcase, Info 
} from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  // Yearly Quotas
  const QUOTAS = {
    sick: 10,
    earned: 15,
    casual: 10,
    emergency: 5
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaves/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data);
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
      await axios.post('/api/leaves/apply', { ...formData, totalDays: days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave protocol successfully initiated for manager review.');
      fetchMyLeaves();
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Transmission failure: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this leave protocol?')) return;
    try {
      await axios.put(`/api/leaves/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave protocol successfully withdrawn.');
      setIsModalOpen(false);
      fetchMyLeaves();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Withdrawal failure: ' + (err.response?.data?.message || err.message));
    }
  };

  // 📊 ANALYTICS CALCULATIONS
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getStats = (type) => {
    const approved = leaves.filter(l => l.leaveType === type && l.status === 'approved');
    const usedTotal = approved.reduce((acc, curr) => acc + (curr.totalDays || 0), 0);
    
    const usedThisMonth = approved.filter(l => {
      const d = new Date(l.startDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + (curr.totalDays || 0), 0);

    const quota = QUOTAS[type] || 0;
    return {
      total: quota,
      used: usedTotal,
      left: Math.max(0, quota - usedTotal),
      month: usedThisMonth
    };
  };

  const stats = {
    sick: getStats('sick'),
    earned: getStats('earned'),
    casual: getStats('casual')
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        
            {/* 🏆 LEAVE STATS TOP BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Sick Leave', key: 'sick', icon: HeartPulse, color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/5' },
             { label: 'Earned Leave', key: 'earned', icon: Briefcase, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/5' },
             { label: 'Casual Leave', key: 'casual', icon: Zap, color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/5' }
           ].map((item, i) => (
             <div key={i} className={`p-6 rounded-3xl border border-[#E6E8EA] bg-white shadow-sm relative overflow-hidden group hover:border-[#F0B90B] transition-all`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${item.bg} rounded-bl-[40px] -mr-4 -mt-4 group-hover:scale-110 transition-transform`}></div>
                
                <div className="flex items-center gap-4 mb-6">
                   <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                   </div>
                   <div>
                      <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#1E2026] italic">{item.label}</h4>
                      <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">Personal Entitlement</p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-[#F5F5F5] pt-6">
                   <div className="text-center">
                      <p className="text-[20px] font-black text-[#1E2026] leading-none mb-1 italic">{stats[item.key].left}</p>
                      <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest">Left</p>
                   </div>
                   <div className="text-center border-x border-[#F5F5F5]">
                      <p className="text-[20px] font-black text-[#1E2026] leading-none mb-1 italic">{stats[item.key].used}</p>
                      <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest">Used</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[20px] font-black text-[#F0B90B] leading-none mb-1 italic">{stats[item.key].month}</p>
                      <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest">This Mo</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#E6E8EA] pb-10">
          <div>
            <h1 className="text-[48px] font-black text-[#1E2026] tracking-tighter leading-none italic uppercase">
              Leave <span className="text-[#F0B90B]">Protocols.</span>
            </h1>
            <p className="text-[#848E9C] font-black text-[10px] uppercase tracking-[0.4em] mt-3 italic">
              Operational Time-Off Distribution Matrix
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {userRole !== 'admin' ? (
            <div className="col-span-12 lg:col-span-5 bg-[#1E2026] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl border-none">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0B90B]/5 blur-[100px] -mr-40 -mt-40"></div>
               
               <div className="relative z-10 mb-10 pb-6 border-b border-white/5">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic">
                     <Send size={18} className="text-[#F0B90B]" />
                     Transmit Protocol
                  </h3>
               </div>

               <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] ml-1">Leave Designation</label>
                     <div className="relative">
                        <select 
                          required
                          value={formData.leaveType}
                          onChange={e => setFormData({...formData, leaveType: e.target.value})}
                          className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[14px] font-black focus:outline-none focus:border-[#F0B90B] transition-all appearance-none cursor-pointer pr-16 italic uppercase"
                        >
                           <option value="" disabled className="bg-[#1E2026]">Choose Strategy</option>
                           <option value="sick" className="bg-[#1E2026]">Sick Protocol</option>
                           <option value="casual" className="bg-[#1E2026]">Casual Protocol</option>
                           <option value="earned" className="bg-[#1E2026]">Earned Entitlement</option>
                           <option value="emergency" className="bg-[#1E2026]">Emergency Breach</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#848E9C]" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] ml-1">Start Cycle</label>
                        <input 
                          type="date" 
                          required
                          value={formData.startDate}
                          onChange={e => setFormData({...formData, startDate: e.target.value})}
                          className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[13px] font-black focus:outline-none focus:border-[#F0B90B] italic"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] ml-1">End Cycle</label>
                        <input 
                          type="date" 
                          required
                          value={formData.endDate}
                          onChange={e => setFormData({...formData, endDate: e.target.value})}
                          className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[13px] font-black focus:outline-none focus:border-[#F0B90B] italic"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] ml-1">Justification Matrix</label>
                     <textarea 
                       required
                       value={formData.reason}
                       onChange={e => setFormData({...formData, reason: e.target.value})}
                       placeholder="State operational deficiency..."
                       className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white text-[13px] font-bold focus:outline-none focus:border-[#F0B90B] min-h-[120px] resize-none italic"
                     />
                  </div>

                  <button type="submit" className="w-full py-5 mt-6 bg-[#F0B90B] text-[#1E2026] rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] hover:bg-white active:scale-95 transition-all italic shadow-2xl border-none cursor-pointer">
                     Apply For Leave
                  </button>
               </form>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-5 bg-[#1E2026] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl border-none flex flex-col items-center justify-center text-center">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0B90B]/5 blur-[100px] -mr-40 -mt-40"></div>
               <ShieldAlert size={60} className="text-[#F0B90B] mb-6 opacity-40" />
               <h3 className="text-[18px] font-black uppercase tracking-[0.3em] italic mb-4">Admin Override</h3>
               <p className="text-[#848E9C] text-[12px] font-bold italic max-w-xs leading-relaxed">
                  System Administration nodes are exempt from standard leave protocols. Personal time-off is managed via global board directives.
               </p>
            </div>
          )}

          {/* LOG HISTORY */}
          <div className="col-span-12 lg:col-span-7 space-y-10 flex flex-col">
             <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-10 border border-[#E6E8EA] rounded-3xl relative overflow-hidden group shadow-sm">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-[#F0B90B]/5 rounded-bl-[40px] -mt-4 -mr-4"></div>
                   <h3 className="text-5xl font-black text-[#1E2026] tabular-nums italic tracking-tighter">{pendingLeaves}</h3>
                   <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] mt-2 italic">Pending Sync</p>
                </div>
                <div className="bg-white p-10 border border-[#E6E8EA] rounded-3xl relative overflow-hidden group shadow-sm">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-[#0ECB81]/5 rounded-bl-[40px] -mt-4 -mr-4"></div>
                   <h3 className="text-5xl font-black text-[#1E2026] tabular-nums italic tracking-tighter">{approvedCount}</h3>
                   <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] mt-2 italic">Finalized Trace</p>
                </div>
             </div>

             <div className="bg-white border border-[#E6E8EA] rounded-3xl flex-1 flex flex-col overflow-hidden shadow-sm">
                <div className="p-10 bg-[#F5F5F5]/30 border-b border-[#E6E8EA]">
                   <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1E2026] italic">Personal Trace History</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-[#E6E8EA]">
                          <th className="px-10 py-6 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] italic">Protocol</th>
                          <th className="px-10 py-6 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] italic text-center">Window</th>
                          <th className="px-10 py-6 text-[10px] font-black text-[#848E9C] uppercase tracking-[0.2em] italic text-right">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E8EA]">
                          {loading ? (
                            <tr><td colSpan="3" className="py-20 text-center text-[11px] text-[#848E9C] font-black uppercase italic animate-pulse">Synchronizing Telemetry...</td></tr>
                          ) : leaves.length === 0 ? (
                            <tr><td colSpan="3" className="py-20 text-center text-[11px] text-[#848E9C] font-black uppercase italic opacity-40">No historical traces detected</td></tr>
                          ) : [...leaves].reverse().map((lv, i) => (
                            <tr key={i} onClick={() => { setSelectedLeave(lv); setIsModalOpen(true); }} className="hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-5">
                                     <div className="w-10 h-10 rounded-2xl bg-[#1E2026] flex items-center justify-center text-white group-hover:bg-[#F0B90B] transition-all italic font-black">
                                        {lv.leaveType.charAt(0).toUpperCase()}
                                     </div>
                                     <span className="text-[14px] font-black text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors italic tracking-tight">{lv.leaveType}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-center">
                                  <p className="text-[14px] font-black text-[#1E2026] tabular-nums italic">{new Date(lv.startDate).toLocaleDateString()}</p>
                                  <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest mt-1">Duration: {lv.totalDays} Units</p>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <div className={`w-2 h-2 rounded-full ${lv.status === 'approved' ? 'bg-[#0ECB81]' : lv.status === 'rejected' ? 'bg-[#F6465D]' : 'bg-[#F0B90B] animate-pulse'}`}></div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-[#1E2026] italic">{lv.status}</span>
                                  </div>
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
      
      {/* DETAILS MODAL */}
      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1E2026]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-none animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#848E9C] mb-2 italic">Trace Identification</p>
                <h3 className="text-3xl font-black text-[#1E2026] uppercase flex items-center gap-6 italic tracking-tighter">
                  {selectedLeave.leaveType} Leave
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${
                    selectedLeave.status === 'approved' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 
                    selectedLeave.status === 'rejected' ? 'bg-[#F6465D]/10 text-[#F6465D]' : 
                    'bg-[#F0B90B]/10 text-[#D0980B]'
                  }`}>
                    {selectedLeave.status}
                  </span>
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white border border-[#E6E8EA] rounded-2xl flex items-center justify-center text-[#848E9C] hover:bg-[#F6465D] hover:text-white transition-all active:scale-90 shadow-sm"><span className="text-lg font-bold">✕</span></button>
            </div>
            
            <div className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div>
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] block mb-2 italic">Start Cycle</label>
                   <p className="text-[18px] font-black text-[#1E2026] tabular-nums italic">{new Date(selectedLeave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] block mb-2 italic">End Cycle</label>
                   <p className="text-[18px] font-black text-[#1E2026] tabular-nums italic">{new Date(selectedLeave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-10 border-y border-[#F5F5F5] py-8">
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] block mb-1 italic">Entitlement Depth</label>
                    <p className="text-[20px] font-black text-[#F0B90B] tabular-nums italic">{selectedLeave.totalDays} Personnel Units</p>
                 </div>
                 <div className="w-[1px] h-10 bg-[#E6E8EA]"></div>
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] block mb-1 italic">Entitlement Level</label>
                    <p className="text-[20px] font-black text-[#1E2026] uppercase italic">{selectedLeave.leaveType}</p>
                 </div>
              </div>

              <div className="p-10 bg-[#F5F5F5] rounded-[32px] border border-[#E6E8EA] relative">
                <Info size={16} className="absolute top-8 right-8 text-[#848E9C]" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#848E9C] block mb-4 italic">Justification Context</label>
                <p className="text-[16px] font-bold text-[#1E2026] leading-relaxed whitespace-pre-wrap italic opacity-80">
                  "{selectedLeave.reason || 'No justification provided for this trace.'}"
                </p>
              </div>
            </div>

            <div className="p-12 pt-0 flex flex-col gap-4">
               {selectedLeave.status === 'pending' && (
                 <button onClick={() => handleCancel(selectedLeave._id)} className="w-full py-6 bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/20 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-[#F6465D] hover:text-white transition-all shadow-sm italic cursor-pointer">Terminate Request</button>
               )}
               <button onClick={() => setIsModalOpen(false)} className="w-full py-6 bg-[#1E2026] text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-[#F0B90B] hover:text-[#1E2026] transition-all italic border-none cursor-pointer">Finalize View</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveManagement;
