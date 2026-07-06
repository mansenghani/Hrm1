import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User, Eye, CheckCircle, XCircle, MoreVertical, RefreshCw, ChevronDown } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '@shared/services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);


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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.fullName?.toLowerCase() || emp.userId?.name?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || emp.userId?.email?.toLowerCase() || '';
    const empId = emp.employeeId?.toLowerCase() || '';

    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      empId.includes(searchTerm.toLowerCase());

    const matchesRole = filterRole ? (emp.role === filterRole || emp.userId?.role === filterRole) : true;

    return matchesSearch && matchesRole;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleRejectAll = async () => {
    const pendingNodes = employees.filter(e => e.status !== 'active' && e.userId?.status !== 'active');
    if (pendingNodes.length === 0) {
      alert('No unverified personnel nodes detected in current matrix.');
      return;
    }

    if (window.confirm(`⚠️ REGISTRY ALERT: You are about to mass-reject/deactivate ${pendingNodes.length} personnel nodes. Proceed?`)) {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        await Promise.all(
          pendingNodes.map(e => axios.delete(`/api/employees/${e._id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        fetchEmployees();
      } catch (err) {
        console.error('Mass veto failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in pb-20 px-8">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-6">
        <div>
          <h1 className="zap-display-hero">Personnel <span className="text-[#ff4f00]">Registry</span></h1>
          <p className="zap-caption-upper text-[#939084] mt-2">Managing Institutional Personnel Matrix</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleRejectAll} className="zap-btn zap-btn-orange h-12 px-6 flex items-center gap-2">
            <XCircle size={16} />
            Reject All Pending
          </button>
          <button onClick={() => navigate('/admin/create-user')} className="zap-btn zap-btn-orange h-12 px-6">
            <UserPlus size={16} className="mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#fffdf9] p-6 border border-[#c5c0b1] rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-10 shadow-sm">
        <div className="relative w-full md:w-96 flex items-center">
          <Search size={18} className="absolute left-4 text-[#939084]" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-[#c5c0b1] rounded-xl pl-12 pr-4 text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative min-w-[180px]" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-12 px-6 bg-white border border-[#ff4f00] rounded-xl text-[12px] font-black uppercase tracking-widest text-[#ff4f00] outline-none flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-[#ff4f00]/5 shadow-sm"
            >
              {filterRole === '' ? 'All Roles' : filterRole.toUpperCase()}
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#eceae3] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { id: '', label: 'All Roles' },
                  { id: 'admin', label: 'Admin' },
                  { id: 'hr', label: 'HR' },
                  { id: 'manager', label: 'Manager' },
                  { id: 'employee', label: 'Employee' }
                ].map((role) => (
                  <div key={role.id} onClick={() => { setFilterRole(role.id); setIsDropdownOpen(false); }} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#201515] hover:bg-[#ff4f00]/5 hover:text-[#ff4f00] cursor-pointer transition-colors border-b border-[#f8f8f8] last:border-none">
                    {role.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-8 border-l border-[#c5c0b1] h-12 flex items-center">
            <span className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">Nodes: <span className="text-[#201515] font-black ml-2">{filteredEmployees.length}</span></span>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-[#eceae3] shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-[#eceae3] text-left">
              <th className="py-5 px-6 text-[11px] font-black text-[#939084] uppercase tracking-widest">Employee ID</th>
              <th className="py-5 px-6 text-[11px] font-black text-[#939084] uppercase tracking-widest">Personnel Entity</th>
              <th className="py-5 px-6 text-[11px] font-black text-[#939084] uppercase tracking-widest text-center">Status Matrix</th>
              <th className="py-5 px-6 text-[11px] font-black text-[#939084] uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eceae3]">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-24">
                  <RefreshCw size={24} className="text-[#ff4f00] animate-spin mx-auto mb-4" />
                  <p className="zap-caption-upper text-[#939084]">Syncing Matrix...</p>
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-[#fffdf9] transition-colors group">
                  <td className="py-6 px-6"><span className="font-black text-[13px] text-[#201515]">{emp.employeeId || 'NODE-UNDEF'}</span></td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#eceae3] border border-[#c5c0b1] rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        {emp.profileImage ? <img src={getImageUrl(emp.profileImage)} alt="User" className="w-full h-full object-cover" /> : <User size={20} className="text-[#939084]" />}
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-[#201515] leading-none mb-1 group-hover:text-[#ff4f00] transition-colors">{emp.fullName || emp.userId?.name || 'Anonymous Node'}</p>
                        <p className="text-[12px] font-bold text-[#939084] uppercase tracking-widest">{emp.email || emp.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.role === 'admin' ? 'bg-[#201515] text-white' : 'bg-[#ff4f00]/10 text-[#ff4f00]'}`}>
                        {emp.role?.toUpperCase() || emp.userId?.role?.toUpperCase() || 'NODE'}
                      </span>
                      <div className={`flex items-center gap-1 text-[11px] font-bold ${emp.status === 'active' || emp.userId?.status === 'active' ? 'text-[#24a148]' : 'text-[#ff4f00]'}`}>
                        {(emp.status === 'active' || emp.userId?.status === 'active') ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {(emp.status?.toUpperCase() || emp.userId?.status?.toUpperCase() || 'ACTIVE')}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/admin/employees/view/${emp._id}`)} className="w-10 h-10 flex items-center justify-center text-[#201515] bg-white border border-[#eceae3] rounded-xl hover:border-[#ff4f00] hover:text-[#ff4f00] transition-all shadow-sm"><Eye size={18} /></button>
                      <button onClick={() => navigate(`/admin/employees/edit/${emp._id}`)} className="w-10 h-10 flex items-center justify-center text-[#201515] bg-white border border-[#eceae3] rounded-xl hover:border-[#ff4f00] hover:text-[#ff4f00] transition-all shadow-sm"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(emp._id)} className="w-10 h-10 flex items-center justify-center text-[#ff4f00] bg-white border border-[#eceae3] rounded-xl hover:bg-[#ff4f00] hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-8 py-5 bg-gray-50 border-t border-[#eceae3]">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#939084]">
              Page {currentPage} of {totalPages} ({filteredEmployees.length} total nodes)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-[#eceae3] ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-[#201515] hover:border-[#ff4f00] hover:text-[#ff4f00] cursor-pointer'}`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
                <button
                  key={pageNo}
                  onClick={() => setCurrentPage(pageNo)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${currentPage === pageNo ? 'bg-[#ff4f00] text-white border-[#ff4f00]' : 'bg-white text-[#201515] border-[#eceae3] hover:border-[#ff4f00] hover:text-[#ff4f00] cursor-pointer'}`}
                >
                  {pageNo}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-[#eceae3] ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-[#201515] hover:border-[#ff4f00] hover:text-[#ff4f00] cursor-pointer'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Employees;
