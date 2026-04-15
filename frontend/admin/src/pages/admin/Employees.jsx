import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const firstName = emp.profile?.firstName || '';
    const lastName = emp.profile?.lastName || '';
    const email = emp.email || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id) => {
    if (window.confirm('Eject this node from the matrix?')) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(employees.filter(e => e._id !== id));
      } catch (err) {
        console.error('Ejection failed:', err);
      }
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Personnel <span className="text-[#F0B90B]">Nodes</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Active Registry Monitoring
          </p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#E6E8EA] focus-within:border-[#F0B90B] transition-all w-full md:w-96 shadow-sm">
              <Search size={18} className="text-[#848E9C]" />
              <input 
                type="text" 
                placeholder="Find node by identity or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-[#1E2026] placeholder:text-[#848E9C] w-full"
              />
           </div>
           <div className="hidden md:flex items-center gap-4 text-[#848E9C] text-[11px] font-bold uppercase tracking-widest">
              <span>Total Nodes:</span>
              <span className="text-[#1E2026] font-black">{employees.length}</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-[#E6E8EA]">
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Node ID</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Trace</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Auth Segment</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest text-right">Operational Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-32">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <div className="w-10 h-10 border-4 border-[#F0B90B]/20 border-t-[#F0B90B] rounded-full animate-spin"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Calibrating Registry Matrix...</p>
                     </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-32 opacity-30">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em]">No active nodes found in this segment</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp._id} className="hover:bg-[#F5F5F5] transition-colors group">
                    <td className="px-10 py-6">
                      <span className="text-[12px] font-black text-[#848E9C] tabular-nums">#{index + 1}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1E2026] border border-[#E6E8EA] shadow-sm transform group-hover:scale-110 transition-transform overflow-hidden bg-white">
                           <User size={18} className="text-[#F0B90B]" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-black text-[#1E2026] tracking-tight group-hover:text-[#F0B90B] transition-colors">
                            {emp.profile?.firstName} {emp.profile?.lastName}
                          </h4>
                          <p className="text-[11px] font-bold text-[#848E9C] tracking-tight">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         emp.role === 'admin' ? 'bg-[#F0B90B]/10 text-[#D0980B]' : 'bg-[#F5F5F5] text-[#848E9C]'
                       }`}>
                         {emp.role}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => navigate(`/admin/employees/edit/${emp._id}`)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-[#848E9C] hover:bg-white hover:text-[#1E2026] hover:shadow-sm border border-transparent hover:border-[#E6E8EA] transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp._id)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-[#F6465D] hover:bg-[#F6465D]/10 transition-all border border-transparent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-[#F5F5F5]/50 px-10 py-6 border-t border-[#E6E8EA] text-center">
           <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-[0.4em]">Protocol Sync Verified: Architecture Node Active</p>
        </div>
      </div>
    </div>
  );
};

export default Employees;
