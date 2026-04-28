import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User, Eye, CheckCircle, XCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@shared/services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
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
    const fullName = emp.fullName?.toLowerCase() || emp.userId?.name?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || emp.userId?.email?.toLowerCase() || '';
    const empId = emp.employeeId?.toLowerCase() || '';

    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      empId.includes(searchTerm.toLowerCase());

    const matchesRole = filterRole ? (emp.role === filterRole || emp.userId?.role === filterRole) : true;

    return matchesSearch && matchesRole;
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

  const handleRejectAll = async () => {
    const pendingNodes = employees.filter(e => e.status !== 'active' && e.userId?.status !== 'active');
    if (pendingNodes.length === 0) {
      alert('No unverified personnel nodes detected in current matrix.');
      return;
    }

    if (window.confirm(`⚠️ REGISTRY ALERT: You are about to mass-reject/deactivate ${pendingNodes.length} personnel nodes. This action is final. Proceed?`)) {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        await Promise.all(
          pendingNodes.map(e => axios.delete(`/api/employees/${e._id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        alert(`Institutional Veto Complete: ${pendingNodes.length} personnel nodes successfully ejected from registry.`);
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-4">
        <div>
          <h1 className="zap-display-hero">All <span className="text-[#ff4f00]">Employees</span></h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRejectAll}
            className="zap-btn zap-btn-orange h-11 px-6 flex items-center gap-2"
          >
            <XCircle size={16} />
            Reject All Pending
          </button>
          <button
            onClick={() => navigate('/admin/create-user')}
            className="zap-btn zap-btn-orange h-11 px-6"
          >
            <UserPlus size={16} className="mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* FILTER BAR - Zapier Style */}
      <div className="bg-[#fffdf9] p-4 border border-[#c5c0b1] rounded-[8px] flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96 flex items-center">
          <Search size={18} className="absolute left-4 text-[#939084]" />
          <input
            type="text"
            placeholder="Filter by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-white border border-[#c5c0b1] rounded-[4px] pl-10 pr-4 text-[14px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-12 bg-white border border-[#c5c0b1] rounded-[4px] px-4 text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00] cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <div className="px-6 border-l border-[#c5c0b1] h-10 flex items-center">
            <span className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">All Employees: <span className="text-[#201515] font-black">{filteredEmployees.length}</span></span>
          </div>
        </div>
      </div>

      {/* DATA TABLE - Zapier Border Forward */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#201515] text-left">
              <th className="py-4 px-4 text-[12px] font-bold text-[#939084] uppercase tracking-widest">Employee ID</th>
              <th className="py-4 px-4 text-[12px] font-bold text-[#939084] uppercase tracking-widest">Employee</th>
              <th className="py-4 px-4 text-[12px] font-bold text-[#939084] uppercase tracking-widest">Operational Status</th>
              <th className="py-4 px-4 text-[12px] font-bold text-[#939084] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
                    <p className="zap-caption-upper text-[#939084]">Synchronizing Registry...</p>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-24 border border-[#c5c0b1] bg-[#fffdf9] rounded-[8px]">
                  <p className="text-[16px] font-medium text-[#939084]">No active personnel nodes matching filter.</p>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp._id} className="border-b border-[#c5c0b1] hover:bg-[#fffdf9] transition-colors group">
                  <td className="py-6 px-4">
                    <span className="font-bold text-[#201515]">{emp.employeeId || 'NODE-UNDEF'}</span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#eceae3] border border-[#c5c0b1] rounded-[4px] flex items-center justify-center overflow-hidden">
                        {emp.profileImage ? <img src={`${API_BASE_URL}${emp.profileImage}`} alt="User" className="w-full h-full object-cover" /> : <User size={18} className="text-[#939084]" />}
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
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/employees/view/${emp._id}`)}
                        className="w-10 h-10 flex items-center justify-center text-[#201515] hover:bg-[#201515] hover:text-[#fffefb] rounded-[4px] transition-all bg-transparent border-none cursor-pointer"
                        title="View Node"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/employees/edit/${emp._id}`)}
                        className="w-10 h-10 flex items-center justify-center text-[#201515] hover:bg-[#201515] hover:text-[#fffefb] rounded-[4px] transition-all bg-transparent border-none cursor-pointer"
                        title="Edit Node"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="w-10 h-10 flex items-center justify-center text-[#ff4f00] hover:bg-[#ff4f00] hover:text-[#fffefb] rounded-[4px] transition-all bg-transparent border-none cursor-pointer"
                        title="Delete Node"
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

      {/* FOOTER STRIP */}
      <div className="mt-12 flex items-center justify-between py-8 border-t border-[#c5c0b1]">
        <div className="flex items-center gap-6">
          <span className="text-[13px] font-bold text-[#939084] uppercase tracking-widest">Active Archives</span>
          <span className="text-[13px] font-medium text-[#201515]">Showing {filteredEmployees.length} registered nodes</span>
        </div>
        <div className="flex gap-4">
          <button className="zap-btn zap-btn-light h-10 px-6 opacity-50 cursor-not-allowed">Previous</button>
          <button className="zap-btn zap-btn-light h-10 px-6">Next Page</button>
        </div>
      </div>
    </div>
  );
};

export default Employees;
