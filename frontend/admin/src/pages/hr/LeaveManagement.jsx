import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, XCircle, Calendar, Users, Filter, Search, MoreHorizontal, User, ArrowUpRight, RefreshCw, Zap } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/leaves';
      if (userRole === 'manager') endpoint = '/api/leaves/manager';
      if (userRole === 'hr') endpoint = '/api/leaves/hr';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Leave Protocol Disrupted:', err);
      setError('Connection to Leave Protocol node disrupted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [userRole]);

  const handleStatusUpdate = async (id, status) => {
    try {
      let endpoint = `/api/leaves/reject/${id}`;
      if (status === 'approved') {
        if (userRole === 'manager') endpoint = `/api/leaves/manager-approve/${id}`;
        else if (userRole === 'hr') endpoint = `/api/leaves/hr-approve/${id}`;
      }

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Protocol ${status === 'approved' ? 'authorized' : 'declined'} successfully.`);
      fetchLeaves();
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const days = calculateDays(createFormData.startDate, createFormData.endDate);
      await axios.post('/api/leaves/apply', { ...createFormData, totalDays: days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave protocol successfully initiated for review.');
      setIsCreateModalOpen(false);
      setCreateFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Node transmission error: ' + (err.response?.data?.message || err.message));
    }
  };

  const pendingCount = leaves.length; // In this view, all fetched leaves are pending for the current role

  return (
    <>
      <div className="animate-fade-in pb-32">
      
      {/* HEADER */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Personnel Logistics</p>
          <h1 className="zap-display-hero">Leave <span className="text-[#ff4f00]">Protocol.</span></h1>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="zap-btn zap-btn-orange h-14 px-8"
        >
          <Calendar size={18} className="mr-3" />
          Request For Leave
        </button>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div className="zap-card group hover:border-[#201515] transition-all">
           <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] text-[#201515] mb-8 group-hover:bg-[#ff4f00] group-hover:text-white flex items-center justify-center transition-all">
              <Users size={20} />
           </div>
           <h3 className="text-[36px] font-medium text-[#201515] tabular-nums leading-none mb-2">98%</h3>
           <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">Presence Pulse</p>
           <div className="mt-8 w-full bg-[#eceae3] rounded-full h-1">
              <div className="bg-[#24a148] h-full rounded-full transition-all duration-1000" style={{ width: '98%' }}></div>
           </div>
        </div>

        <div className="zap-card group hover:border-[#201515] transition-all">
           <div className={`w-12 h-12 rounded-[8px] mb-8 flex items-center justify-center transition-all ${pendingCount > 0 ? 'bg-[#fffdf9] border border-[#ff4f00] text-[#ff4f00]' : 'bg-[#eceae3] text-[#939084]'}`}>
              <ShieldAlert size={20} />
           </div>
           <h3 className="text-[36px] font-medium text-[#201515] tabular-nums leading-none mb-2">{pendingCount}</h3>
           <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">
             {userRole === 'manager' ? 'Awaiting My Approval' : 'Awaiting HR Approval'}
           </p>
           <p className={`mt-8 text-[11px] font-bold uppercase tracking-widest ${pendingCount > 0 ? 'text-[#ff4f00] animate-pulse' : 'text-[#939084]'}`}>
              {pendingCount > 0 ? 'Immediate Action' : 'System Synchronized'}
           </p>
        </div>

        <div className="md:col-span-2 zap-card bg-[#201515] text-[#fffefb] p-10 flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff4f00]/10 blur-3xl rounded-full"></div>
           <div className="relative z-10">
              <p className="zap-caption-upper !text-[#939084] mb-4">Organizational Quota Trace</p>
              <h4 className="text-[28px] font-medium leading-tight mb-4">Standard cycle set to <span className="text-[#ff4f00]">24 units</span> per personnel node.</h4>
           </div>
           <button className="text-[#ff4f00] font-bold text-[14px] uppercase tracking-widest flex items-center gap-2 hover:underline bg-transparent border-none p-0 cursor-pointer transition-all">
              Modify Global Protocol <ArrowUpRight size={18} />
           </button>
           <Calendar size={100} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
        </div>
      </div>

      {/* REQUEST TABLE */}
      <div className="zap-card p-0 overflow-hidden">
        <div className="p-8 bg-[#fffdf9] border-b border-[#c5c0b1] flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-[14px] font-black uppercase tracking-widest text-[#201515]">
             {userRole === 'manager' ? 'Direct Report Matrix' : 'Manager Approved Matrix'}
           </h3>
           <div className="flex items-center gap-4 bg-white px-6 h-12 rounded-[4px] border border-[#c5c0b1] focus-within:border-[#ff4f00] transition-all w-full md:w-96">
              <Search size={18} className="text-[#939084]" />
              <input 
                type="text" 
                placeholder="Search trace..." 
                className="bg-transparent border-none focus:outline-none text-[14px] font-medium text-[#201515] w-full" 
              />
           </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
             <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
             <p className="zap-caption-upper text-[#939084]">Tracing Matrix...</p>
          </div>
        ) : error ? (
           <div className="py-24 text-center text-[#ff4f00] font-bold uppercase tracking-widest text-[13px]">{error}</div>
        ) : leaves.length === 0 ? (
           <div className="py-24 text-center text-[#939084] font-medium text-[15px]">Matrix queue empty</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                  <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Personnel Node</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Cycle Window</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Status Trace</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">Ops Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c0b1]">
                {leaves.map((row, i) => (
                  <tr 
                    key={row?._id || i} 
                    onClick={() => {
                      setSelectedLeave(row);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-[#fffdf9] transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[4px] bg-[#eceae3] border border-[#c5c0b1] flex items-center justify-center text-[#201515] font-bold text-xs">
                             {(row?.user?.name || 'U').charAt(0)}
                          </div>
                          <div>
                             <p className="text-[15px] font-bold text-[#201515] uppercase group-hover:text-[#ff4f00] transition-colors">
                                {row?.user?.name || 'Anonymous Node'}
                             </p>
                             <p className="text-[12px] font-medium text-[#939084] mt-1">
                                {row?.user?.email}
                             </p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-[#eceae3] rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-[#201515]">
                          {row?.leaveType}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-[14px] font-bold text-[#201515] tabular-nums uppercase">
                          {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                       </p>
                       <p className="text-[11px] font-bold text-[#ff4f00] uppercase tracking-widest mt-1">{row?.totalDays || 0} Units</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${
                         row?.status === 'approved' ? 'bg-[#24a148] text-white' : 
                         row?.status === 'rejected' ? 'bg-[#ff4f00] text-white' : 
                         'bg-[#fffdf9] border border-[#ff4f00] text-[#ff4f00] animate-pulse'
                       }`}>
                         {row?.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {row?.status === 'pending' && (
                             <>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleStatusUpdate(row._id, 'approved');
                                 }} 
                                 className="w-10 h-10 flex items-center justify-center bg-[#24a148] text-white rounded-[4px] hover:bg-[#1e8a3d] transition-all"
                               >
                                  <CheckCircle size={18} />
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleStatusUpdate(row._id, 'rejected');
                                 }} 
                                 className="w-10 h-10 flex items-center justify-center bg-[#ff4f00] text-white rounded-[4px] hover:bg-[#201515] transition-all"
                               >
                                  <XCircle size={18} />
                               </button>
                             </>
                          )}
                          <button className="w-10 h-10 flex items-center justify-center text-[#939084] hover:text-[#201515] transition-all bg-transparent border-none cursor-pointer"><MoreHorizontal size={18} /></button>
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
    
    {/* DETAILS MODAL */}
    {isModalOpen && selectedLeave && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#201515]/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#fffefb] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-[#c5c0b1] animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-[#c5c0b1] bg-[#fffdf9] flex justify-between items-center">
            <div>
              <p className="zap-caption-upper !text-[#ff4f00] mb-2">Request Validation</p>
              <h3 className="text-2xl font-medium text-[#201515] uppercase flex items-center gap-4">
                {selectedLeave?.user?.name || 'Personnel Node'}
                <span className={`px-4 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${
                  selectedLeave.status === 'approved' ? 'bg-[#24a148] text-white' : 
                  selectedLeave.status === 'rejected' ? 'bg-[#ff4f00] text-white' : 
                  'bg-[#eceae3] text-[#201515]'
                }`}>
                  {selectedLeave.status}
                </span>
              </h3>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-10 h-10 bg-white border border-[#c5c0b1] rounded-[4px] flex items-center justify-center text-[#939084] hover:bg-[#ff4f00] hover:text-white transition-all active:scale-90"
            >
              <span className="text-lg font-bold">✕</span>
            </button>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084] block mb-2">Protocol Window</label>
                <p className="text-[16px] font-bold text-[#201515] tabular-nums">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
                <p className="text-[12px] font-bold text-[#ff4f00] uppercase mt-1">{selectedLeave.totalDays} Total Units</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084] block mb-2">Leave Designation</label>
                <p className="text-[16px] font-bold text-[#201515] uppercase">{selectedLeave.leaveType} Leave</p>
              </div>
            </div>

            <div className="p-8 bg-[#fffdf9] rounded-[8px] border border-[#c5c0b1]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084] block mb-4">Justification Matrix</label>
              <p className="text-[15px] font-medium text-[#201515] leading-relaxed whitespace-pre-wrap">
                {selectedLeave.reason || 'No justification trace found.'}
              </p>
            </div>
          </div>

          <div className="p-10 pt-0 flex gap-4">
             <button 
               onClick={() => {
                 handleStatusUpdate(selectedLeave._id, 'approved');
                 setIsModalOpen(false);
               }}
               className="flex-1 py-5 bg-[#24a148] text-white rounded-[4px] font-bold text-[12px] uppercase tracking-widest hover:opacity-90 transition-all"
             >
               Authorize Request
             </button>
             <button 
               onClick={() => {
                 handleStatusUpdate(selectedLeave._id, 'rejected');
                 setIsModalOpen(false);
               }}
               className="flex-1 py-5 bg-[#ff4f00] text-white rounded-[4px] font-bold text-[12px] uppercase tracking-widest hover:bg-[#201515] transition-all"
             >
               Decline Trace
             </button>
             <button 
               onClick={() => setIsModalOpen(false)}
               className="flex-1 py-5 border border-[#c5c0b1] text-[#201515] rounded-[4px] font-bold text-[12px] uppercase tracking-widest hover:bg-[#eceae3] transition-all"
             >
               Close View
             </button>
          </div>
        </div>
      </div>
    )}

    {/* CREATE LEAVE MODAL */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#201515]/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#fffefb] w-full max-w-lg rounded-lg overflow-hidden shadow-2xl border border-[#c5c0b1] animate-in zoom-in-95 duration-300">
           <div className="p-6 border-b border-[#c5c0b1] bg-[#fffdf9] flex justify-between items-center">
              <div>
                <p className="zap-caption-upper !text-[#ff4f00] mb-1">Internal Protocol</p>
                <h3 className="text-xl font-medium text-[#201515] uppercase">Initiate Leave Trace</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-10 h-10 bg-white border border-[#c5c0b1] rounded-[4px] flex items-center justify-center text-[#939084] hover:bg-[#ff4f00] hover:text-white transition-all"
              >
                <span className="text-lg font-bold">✕</span>
              </button>
           </div>

           <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084]">Leave Designation</label>
                 <select 
                   required
                   value={createFormData.leaveType}
                   onChange={e => setCreateFormData({...createFormData, leaveType: e.target.value})}
                   className="w-full h-12 px-8 rounded-[4px] bg-white border border-[#c5c0b1] text-[#201515] text-[13px] font-bold focus:outline-none focus:border-[#ff4f00] appearance-none"
                 >
                    <option value="" disabled>Choose the option</option>
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="emergency">Emergency Leave</option>
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084]">Start Cycle</label>
                    <input 
                      type="date" 
                      required
                      value={createFormData.startDate}
                      onChange={e => setCreateFormData({...createFormData, startDate: e.target.value})}
                      className="w-full h-12 px-5 rounded-[4px] bg-white border border-[#c5c0b1] text-[#201515] text-[13px] font-bold focus:outline-none focus:border-[#ff4f00]"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084]">End Cycle</label>
                    <input 
                      type="date" 
                      required
                      value={createFormData.endDate}
                      onChange={e => setCreateFormData({...createFormData, endDate: e.target.value})}
                      className="w-full h-12 px-5 rounded-[4px] bg-white border border-[#c5c0b1] text-[#201515] text-[13px] font-bold focus:outline-none focus:border-[#ff4f00]"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-[#939084]">Justification Matrix</label>
                 <textarea 
                   required
                   value={createFormData.reason}
                   onChange={e => setCreateFormData({...createFormData, reason: e.target.value})}
                   placeholder="Provide internal context..."
                   className="w-full p-5 rounded-[4px] bg-white border border-[#c5c0b1] text-[#201515] text-[13px] font-medium focus:outline-none focus:border-[#ff4f00] min-h-[100px] resize-none"
                 />
              </div>

              <div className="pt-2 flex gap-4">
                 <button type="submit" className="flex-1 py-4 bg-[#ff4f00] text-white rounded-[4px] font-bold text-[11px] uppercase tracking-widest hover:bg-[#201515] transition-all">
                    Request For Leave
                 </button>
                 <button 
                   type="button"
                   onClick={() => setIsCreateModalOpen(false)}
                   className="flex-1 py-4 border border-[#c5c0b1] text-[#201515] rounded-[4px] font-bold text-[11px] uppercase tracking-widest hover:bg-[#eceae3] transition-all"
                 >
                    Cancel
                 </button>
              </div>
           </form>
        </div>
      </div>
    )}
  </>
);
};

export default LeaveManagement;
