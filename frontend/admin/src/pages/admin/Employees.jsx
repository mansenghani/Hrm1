import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User, Eye, CheckCircle, XCircle } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.fullName?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || '';
    const empId = emp.employeeId?.toLowerCase() || '';
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase()) || 
                          empId.includes(searchTerm.toLowerCase());
                          
    const matchesRole = filterRole ? emp.role === filterRole : true;
    const matchesDept = filterDepartment ? emp.department?.name === filterDepartment : true;
    
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Eject this node from the matrix (Deactivate)?')) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEmployees();
      } catch (err) {
        console.error('Deactivation failed:', err);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
     try {
       const token = sessionStorage.getItem('token');
       const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
       await axios.patch(`/api/employees/${id}/status`, { status: newStatus }, {
         headers: { Authorization: `Bearer ${token}` }
       });
       fetchEmployees();
     } catch (err) {
       console.error('Status update failed', err);
     }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Personnel <span className="text-[#F0B90B]">Registry</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Active personnel nodes
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/employees/add')}
          className="bg-[#1E2026] text-white px-6 py-3 rounded-xl font-black uppercase text-[12px] tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-2xl active:scale-[0.98]"
        >
          <UserPlus size={16} /> Ensure Node
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-[#E6E8EA] rounded-2xl overflow-hidden shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        <div className="p-8 border-b border-[#E6E8EA] bg-[#F5F5F5]/30 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#E6E8EA] focus-within:border-[#F0B90B] transition-all w-full md:w-96 shadow-sm">
              <Search size={18} className="text-[#848E9C]" />
              <input 
                type="text" 
                placeholder="Find node by identity, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-[#1E2026] placeholder:text-[#848E9C] w-full"
              />
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
             <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white border border-[#E6E8EA] px-4 py-3 rounded-xl text-[12px] font-bold text-[#1E2026] outline-none focus:border-[#F0B90B]"
             >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
             </select>
             
             <div className="hidden md:flex items-center gap-4 text-[#848E9C] text-[11px] font-bold uppercase tracking-widest pl-4 border-l border-[#E6E8EA]">
                <span>Total Nodes:</span>
                <span className="text-[#1E2026] font-black">{filteredEmployees.length}</span>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-[#E6E8EA]">
                <th className="px-6 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Node ID</th>
                <th className="px-6 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Trace</th>
                <th className="px-6 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Dept.</th>
                <th className="px-6 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest">Status/Role</th>
                <th className="px-6 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-widest text-right">Operational Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EA]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-32">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <div className="w-10 h-10 border-4 border-[#F0B90B]/20 border-t-[#F0B90B] rounded-full animate-spin"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Calibrating Registry Matrix...</p>
                     </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-32 opacity-30">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em]">No active nodes found</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#F5F5F5] transition-colors group">
                    <td className="px-6 py-6">
                      <span className="text-[12px] font-black text-[#1E2026] tabular-nums">{emp.employeeId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1E2026] border border-[#E6E8EA] shadow-sm transform group-hover:scale-110 transition-transform overflow-hidden bg-white">
                           {emp.profileImage ? <img src={emp.profileImage} alt="User" /> : <User size={16} className="text-[#F0B90B]" />}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-[#1E2026] tracking-tight group-hover:text-[#F0B90B] transition-colors">
                            {emp.fullName}
                          </h4>
                          <p className="text-[11px] font-bold text-[#848E9C] tracking-tight">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                        <div className="text-[12px] font-bold text-[#1E2026]">{emp.department?.name || 'Unassigned'}</div>
                        <div className="text-[10px] text-[#848E9C] font-bold mt-1">Mgr: {emp.managerId?.name || 'None'}</div>
                    </td>
                    <td className="px-6 py-6 border-l border-transparent group-hover:border-[#E6E8EA]/50">
                       <div className="flex flex-col gap-2 items-start">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           emp.role === 'admin' ? 'bg-[#F0B90B]/10 text-[#D0980B]' : 'bg-[#F5F5F5] text-[#848E9C]'
                         }`}>
                           {emp.role}
                         </span>
                         <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                            emp.status === 'active' ? 'text-green-500' : 'text-red-500'
                         }`}>
                           {emp.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                           {emp.status}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => toggleStatus(emp._id, emp.status)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:bg-white hover:text-[#1E2026] transition-all"
                          title={emp.status === 'active' ? "Deactivate" : "Activate"}
                        >
                          {emp.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/employees/view/${emp._id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:bg-white hover:text-[#1E2026] hover:shadow-sm border border-transparent hover:border-[#E6E8EA] transition-all"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/employees/edit/${emp._id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:bg-white hover:text-[#1E2026] hover:shadow-sm border border-transparent hover:border-[#E6E8EA] transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F6465D] hover:bg-[#F6465D]/10 transition-all border border-transparent"
                        >
                          <Trash2 size={14} />
                        </button>
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

export default Employees;
