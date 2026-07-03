import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@shared/services/api';

const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const normalized = path.replace(/\\/g, '/');
    return `${API_BASE_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  };

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
      alert('No unverified personnel nodes detected in HR matrix.');
      return;
    }

    if (window.confirm(`⚠️ HR AUTHORITY ALERT: You are about to mass-reject/deactivate ${pendingNodes.length} personnel nodes. This action is final. Proceed?`)) {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        await Promise.all(
          pendingNodes.map(e => axios.delete(`/api/employees/${e._id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        alert(`Institutional Veto Complete: ${pendingNodes.length} personnel nodes successfully ejected from matrix.`);
        fetchEmployees();
      } catch (err) {
        console.error('Mass veto failed:', err);
        alert('Institutional Veto disrupted. Check registry connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* HEADER SECTION */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-8">
        <div>
          <h1 className="zap-display-hero">Employee <span className="text-[#ff4f00]">Registry</span></h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRejectAll}
            className="zap-btn zap-btn-orange h-14 px-8 flex items-center gap-2"
          >
            <XCircle size={18} />
            Reject All Pending
          </button>
          <button
            onClick={() => navigate('/hr/employees/create')}
            className="zap-btn zap-btn-dark h-14 px-8 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Register Node
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-[#939084]" size={18} />
          <input
            type="text"
            placeholder="FILTER PERSONNEL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="zap-input pl-12 h-12 uppercase font-black"
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="zap-input h-12 uppercase font-black"
          >
            <option value="">ALL ROLES</option>
            <option value="admin">ADMINS</option>
            <option value="hr">HR OFFICERS</option>
            <option value="manager">MANAGERS</option>
            <option value="employee">EMPLOYEES</option>
          </select>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="zap-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                <th className="py-5 px-4 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Matrix Node ID</th>
                <th className="py-5 px-4 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Personnel Metadata</th>
                <th className="py-5 px-4 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Privilege / Status</th>
                <th className="py-5 px-4 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em] text-right">Matrix Authority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae3]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <RefreshCw className="animate-spin text-[#ff4f00] mx-auto mb-4" size={24} />
                    <p className="zap-caption-upper text-[#939084]">Syncing Matrix...</p>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-24 border border-[#c5c0b1] bg-[#fffdf9] rounded-[8px]">
                    <p className="text-[16px] font-medium text-[#939084]">No active personnel nodes matching filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp._id} className="border-b border-[#c5c0b1] hover:bg-[#fffdf9] transition-colors group">
                    <td className="py-6 px-4">
                      <span className="font-bold text-[#201515]">{emp.employeeId || 'NODE-UNDEF'}</span>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#eceae3] border border-[#c5c0b1] rounded-[4px] flex items-center justify-center overflow-hidden">
                          {emp.profileImage ? <img src={getImageUrl(emp.profileImage)} alt="User" className="w-full h-full object-cover" /> : <User size={18} className="text-[#939084]" />}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[#201515] leading-none mb-2">{emp.fullName || emp.userId?.name || 'Anonymous Node'}</p>
                          <p className="text-[13px] font-medium text-[#939084] leading-none">{emp.email || emp.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-4">
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${emp.role === 'admin' ? 'bg-[#201515] text-white' : 'bg-[#eceae3] text-[#201515]'}`}>
                          {emp.role?.toUpperCase() || emp.userId?.role?.toUpperCase() || 'NODE'}
                        </span>
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${emp.status === 'active' || emp.userId?.status === 'active' ? 'text-[#24a148]' : 'text-[#ff4f00]'}`}>
                          {(emp.status === 'active' || emp.userId?.status === 'active') ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {(emp.status?.toUpperCase() || emp.userId?.status?.toUpperCase() || 'ACTIVE')}
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/hr/employees/view/${emp._id}`)}
                          className="zap-btn zap-btn-outline w-10 h-10 flex items-center justify-center p-0"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/hr/employees/edit/${emp._id}`)}
                          className="zap-btn zap-btn-outline w-10 h-10 flex items-center justify-center p-0"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="zap-btn zap-btn-outline w-10 h-10 flex items-center justify-center p-0 text-[#ff4f00]"
                        >
                          <Trash2 size={18} />
                        </button>
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
    </div>
  );
};

export default HREmployees;
