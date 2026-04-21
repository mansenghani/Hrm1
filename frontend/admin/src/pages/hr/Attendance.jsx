import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Filter, MoreVertical, CheckCircle, Clock, XCircle, TrendingUp, Search, RefreshCw } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      // Using relative path to utilize Vite proxy and handle environmental shifts
      const res = await axios.get('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Presence Sync Failure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = attendance.filter(item => {
    const firstName = item.employeeId?.fullName || item.employeeId?.profile?.firstName || 'Unknown';
    const lastName = item.employeeId?.profile?.lastName || '';
    const name = `${firstName} ${lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in pb-32">
      
      {/* HEADER */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Workforce Synchronization</p>
          <h1 className="zap-display-hero">Real-time <span className="text-[#ff4f00]">Presence.</span></h1>
        </div>
        <div className="flex gap-4">
           <button className="zap-btn zap-btn-light h-14 px-8">
              <Download size={18} className="mr-3" />
              Export Protocol
           </button>
           <button className="zap-btn zap-btn-orange h-14 px-8">
              <Calendar size={18} className="mr-3" />
              Presence Report
           </button>
        </div>
      </div>

      {/* DATA HUB - Zapier Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {[
          { label: 'Currently Active', val: attendance.filter(a => !a?.clockOut).length, status: 'Success', icon: CheckCircle, color: 'text-[#24a148]' },
          { label: 'Late Syncs', val: '12', status: 'Warning', icon: Clock, color: 'text-[#ff4f00]' },
          { label: 'Ejected Nodes', val: '8', status: 'Offline', icon: XCircle, color: 'text-[#201515]' },
          { label: 'Avg Pulse', val: '08:42', status: 'Optimal', icon: TrendingUp, color: 'text-[#ff4f00]' }
        ].map((stat, i) => (
          <div key={i} className="zap-card group hover:border-[#201515] transition-all">
             <div className="flex justify-between items-start mb-10">
                <div className={`w-12 h-12 rounded-[8px] bg-[#eceae3] flex items-center justify-center ${stat.color} transition-all`}>
                   <stat.icon size={20} />
                </div>
                <span className="text-[11px] font-bold text-[#ff4f00] uppercase tracking-widest">{stat.status}</span>
             </div>
             <div className="text-left">
                <h3 className="text-[32px] font-medium text-[#201515] tabular-nums leading-none mb-2">{stat.val}</h3>
                <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* PRESENCE MATRIX - Zapier Border Forward */}
      <div className="zap-card p-0 overflow-hidden">
        <div className="p-8 border-b border-[#c5c0b1] bg-[#fffdf9] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 bg-white px-6 h-12 rounded-[4px] border border-[#c5c0b1] focus-within:border-[#ff4f00] transition-all w-full md:w-96">
              <Search size={18} className="text-[#939084]" />
              <input 
                type="text" 
                placeholder="Find presence by node name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[14px] font-medium text-[#201515] placeholder:text-[#939084] w-full"
              />
           </div>
           <button onClick={fetchData} className="zap-btn zap-btn-light h-12 px-6">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Personnel Unit</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Sync Cycle</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Check-In</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Check-Out</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c0b1]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
                    <p className="zap-caption-upper text-[#939084]">Querying Presence Hub...</p>
                  </div>
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-24">
                   <p className="text-[15px] font-medium text-[#939084]">No presence logs recorded in this segment</p>
                </td></tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-[#fffdf9] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[4px] bg-[#eceae3] border border-[#c5c0b1] flex items-center justify-center text-[#201515] font-bold text-xs uppercase">
                           {(row.employeeId?.fullName || row.employeeId?.profile?.firstName || 'U').charAt(0)}
                        </div>
                        <span className="text-[15px] font-bold text-[#201515]">
                           {row.employeeId?.fullName || `${row.employeeId?.profile?.firstName || ''} ${row.employeeId?.profile?.lastName || ''}`.trim() || 'Anonymous Node'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] font-medium text-[#939084] tabular-nums">{row.date}</td>
                    <td className="px-8 py-6">
                       <span className="text-[16px] font-medium text-[#201515] tabular-nums">{row.clockIn || '--:--'}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[14px] font-medium text-[#939084] tabular-nums">{row.clockOut || '--:--'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`px-4 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${
                         row.clockOut ? 'bg-[#eceae3] text-[#939084]' : 'bg-[#fffdf9] text-[#24a148] border border-[#24a148]'
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
        
        <div className="bg-[#fffdf9] px-10 py-8 border-t border-[#c5c0b1] text-center">
           <p className="text-[11px] font-bold text-[#939084] uppercase tracking-[0.2em] italic">Core Synchronization Integrity: High Operation Path</p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
