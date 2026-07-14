import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Edit3, User, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '@shared/services/api';

const HREmployees = () => {
  const [dbEmployees, setDbEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);


  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDbEmployees(res.data || []);
    } catch (err) {
      console.error('Fetch employees failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Global click listener to close actions dropdown on clicking outside
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.fullName?.toLowerCase() || emp.userId?.name?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || emp.userId?.email?.toLowerCase() || '';
    const empId = emp.employeeId?.toLowerCase() || '';

    const matchesSearch = fullName.includes(search) ||
      email.includes(search) ||
      dept.includes(search) ||
      desig.includes(search);

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
        await axios.patch(`/api/employees/${emp._id}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchEmployees();
      } catch (err) {
        console.error('Status update failed:', err);
      }
    }
  };

  const handleEdit = (id) => {
    if (id.startsWith('sample-')) {
      alert('Demo personnel records cannot be modified.');
      return;
    }
    navigate(`/hr/employees/edit/${id}`);
  };

  const handleView = (id) => {
    if (id.startsWith('sample-')) {
      alert(`Viewing demo profile for ${SAMPLE_EMPLOYEES.find(e => e._id === id)?.fullName}`);
      return;
    }
    navigate(`/hr/employees/view/${id}`);
  };

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Email', 'Department', 'Designation', 'Join Date', 'Status'];
    const rows = filteredEmployees.map(emp => [
      emp.fullName,
      emp.email,
      emp.department,
      emp.designation,
      formatDate(emp.joinDate),
      emp.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return dateStr.substring(0, 10);
    } catch (e) {
      return dateStr;
    }
  };

  const renderStatusBadge = (status) => {
    const isActive = status.toLowerCase() === 'active';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isActive
        ? 'bg-[#e2f7ed] text-[#00875a] dark:bg-[#112a20] dark:text-[#3cd070]'
        : 'bg-[#f4f5f7] text-[#5e6c84] dark:bg-[#202528] dark:text-[#a0a5aa]'
        }`}>
        {isActive ? 'Active' : 'On Leave'}
      </span>
    );
  };

  return (
    <div className="animate-fade-in w-full pb-12">
      {/* 1. Page Title & Action Buttons Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-white leading-none">Employees</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Directory of everyone in your company.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="verdant-btn-outline h-10 px-5 flex items-center gap-2 text-sm font-semibold rounded-full border border-gray-200 dark:border-[#1a2d29] bg-white dark:bg-[#111c18] hover:bg-gray-50 dark:hover:bg-[#162722] text-[#374151] dark:text-[#cbd5e1] transition-all shadow-sm cursor-pointer"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          <button
            onClick={() => navigate('/hr/employees/create')}
            className="zap-btn zap-btn-dark h-14 px-8 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add employee</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Row */}
      <div className="w-full mb-6">
        <div className="flex gap-3 items-center w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111c18] border border-gray-200 dark:border-[#1a2d29] rounded-full text-sm font-medium focus:outline-none focus:border-[#00a76b] focus:ring-2 focus:ring-[#00a76b]/10 transition-all shadow-sm text-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFiltersPanel(!showFiltersPanel);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap ${showFiltersPanel
              ? 'bg-[#e2f7ed] border-[#00a76b] text-[#00a76b] dark:bg-[#162722] dark:border-[#00a76b]'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#111c18] dark:border-[#1a2d29] dark:text-[#cbd5e1] dark:hover:bg-[#162722]'
              }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>
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

      {/* 3. Table Card Container */}
      <div className="bg-white dark:bg-[#111c18] border border-[#e2eae7] dark:border-[#1a2d29] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-[#111c18]">
            <RefreshCw size={24} className="text-[#00a76b] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Syncing Employee Registry...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111c18]">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#162722] rounded-full flex items-center justify-center mx-auto text-gray-400 dark:text-gray-500 mb-3">
              <User size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No employees found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e2eae7] dark:border-[#1a2d29] bg-[#f9fafb]/50 dark:bg-[#162722]/30">
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMPLOYEE</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DEPARTMENT</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DESIGNATION</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">JOIN DATE</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
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
                  </td>
                  {/* Department */}
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-300">
                    {emp.department}
                  </td>
                  {/* Designation */}
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-400">
                    {emp.designation}
                  </td>
                  {/* Join Date */}
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-normal">
                    {formatDate(emp.joinDate)}
                  </td>
                  {/* Status badge */}
                  <td className="py-4 px-6">
                    {renderStatusBadge(emp.status)}
                  </td>
                  {/* Row-level dropdown options */}
                  <td className="py-4 px-6 text-right relative">
                    <button
                      onClick={() => navigate(`/hr/employees/view/${emp._id}`)}
                      className="zap-btn zap-btn-outline w-10 h-10 flex items-center justify-center p-0"
                    >
                      <MoreHorizontal size={18} />
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
    </div >
  );
};

export default HREmployees;
