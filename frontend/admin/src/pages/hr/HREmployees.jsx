import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Edit3, 
  User, 
  Eye, 
  RefreshCw, 
  Download, 
  Plus, 
  SlidersHorizontal,
  MoreHorizontal
} from 'lucide-react';

const SAMPLE_EMPLOYEES = [
  {
    _id: 'sample-1',
    fullName: 'Sara Lopez',
    email: 'sara@acme.co',
    department: 'Design',
    designation: 'Product Designer',
    joinDate: '2022-03-14',
    status: 'Active',
    employeeId: 'EMP-001'
  },
  {
    _id: 'sample-2',
    fullName: 'Daniel Kim',
    email: 'daniel@acme.co',
    department: 'Engineering',
    designation: 'Engineering Lead',
    joinDate: '2020-08-01',
    status: 'Active',
    employeeId: 'EMP-002'
  },
  {
    _id: 'sample-3',
    fullName: 'Priya Shah',
    email: 'priya@acme.co',
    department: 'HR',
    designation: 'HR Manager',
    joinDate: '2019-11-22',
    status: 'Active',
    employeeId: 'EMP-003'
  },
  {
    _id: 'sample-4',
    fullName: 'Marcus Lee',
    email: 'marcus@acme.co',
    department: 'Engineering',
    designation: 'Senior Engineer',
    joinDate: '2021-06-10',
    status: 'Active',
    employeeId: 'EMP-004'
  },
  {
    _id: 'sample-5',
    fullName: 'Aisha Khan',
    email: 'aisha@acme.co',
    department: 'Marketing',
    designation: 'Marketing Lead',
    joinDate: '2022-01-05',
    status: 'On Leave',
    employeeId: 'EMP-005'
  },
  {
    _id: 'sample-6',
    fullName: 'Jonas Becker',
    email: 'jonas@acme.co',
    department: 'Sales',
    designation: 'Account Executive',
    joinDate: '2023-02-19',
    status: 'Active',
    employeeId: 'EMP-006'
  },
  {
    _id: 'sample-7',
    fullName: 'Mei Chen',
    email: 'mei@acme.co',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    joinDate: '2023-09-04',
    status: 'Active',
    employeeId: 'EMP-007'
  },
  {
    _id: 'sample-8',
    fullName: 'Olivia Brown',
    email: 'olivia@acme.co',
    department: 'Finance',
    designation: 'Accountant',
    joinDate: '2021-04-12',
    status: 'Active',
    employeeId: 'EMP-008'
  }
];

const HREmployees = () => {
  const [dbEmployees, setDbEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeActionId, setActiveActionId] = useState(null);
  const navigate = useNavigate();

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
    const handleOutsideClick = () => {
      setActiveActionId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Merge database employees with our premium pre-populated sample employees to avoid duplication
  const mergedEmployees = [
    ...SAMPLE_EMPLOYEES,
    ...dbEmployees.filter(dbEmp => {
      const dbEmail = (dbEmp.email || dbEmp.userId?.email || '').toLowerCase();
      return dbEmail && !SAMPLE_EMPLOYEES.some(s => s.email.toLowerCase() === dbEmail);
    }).map(dbEmp => ({
      _id: dbEmp._id,
      fullName: dbEmp.fullName || dbEmp.userId?.name || 'Anonymous Node',
      email: dbEmp.email || dbEmp.userId?.email || '',
      department: dbEmp.department || 'Staff',
      designation: dbEmp.designation || 'Staff Member',
      joinDate: dbEmp.joinDate || dbEmp.createdAt || new Date(),
      status: dbEmp.status || (dbEmp.userId?.status === 'active' ? 'Active' : 'On Leave'),
      employeeId: dbEmp.employeeId || 'EMP-DB'
    }))
  ];

  // Perform search and filter calculations
  const filteredEmployees = mergedEmployees.filter(emp => {
    const fullName = emp.fullName?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || '';
    const dept = emp.department?.toLowerCase() || '';
    const desig = emp.designation?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(search) ||
      email.includes(search) ||
      dept.includes(search) ||
      desig.includes(search);

    const matchesDept = filterDept ? emp.department.toLowerCase() === filterDept.toLowerCase() : true;
    const matchesStatus = filterStatus ? emp.status.toLowerCase() === filterStatus.toLowerCase() : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (id.startsWith('sample-')) {
      alert('Demo personnel records cannot be deactivated.');
      return;
    }
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive 
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
            onClick={() => navigate('/hr/create-user')}
            className="verdant-btn-primary h-10 px-5 flex items-center gap-2 text-sm font-semibold rounded-full text-white bg-[#00a76b] hover:bg-[#00915c] transition-all shadow-sm cursor-pointer border-none"
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
              showFiltersPanel 
                ? 'bg-[#e2f7ed] border-[#00a76b] text-[#00a76b] dark:bg-[#162722] dark:border-[#00a76b]' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#111c18] dark:border-[#1a2d29] dark:text-[#cbd5e1] dark:hover:bg-[#162722]'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Dropdown Panel */}
        {showFiltersPanel && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-white dark:bg-[#111c18] border border-gray-200 dark:border-[#1a2d29] rounded-2xl shadow-sm animate-fade-in"
          >
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#162722] border border-gray-200 dark:border-[#1a2d29] rounded-lg text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] focus:outline-none focus:border-[#00a76b]"
              >
                <option value="">All Departments</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#162722] border border-gray-200 dark:border-[#1a2d29] rounded-lg text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] focus:outline-none focus:border-[#00a76b]"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        )}
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
              </thead>
              <tbody className="divide-y divide-[#e2eae7] dark:divide-[#1a2d29]">
                {filteredEmployees.map((emp) => {
                  const initials = getInitials(emp.fullName);
                  return (
                    <tr key={emp._id} className="hover:bg-[#f2fbf6]/50 dark:hover:bg-[#162722]/30 transition-colors group">
                      {/* Initials Avatar + Info block */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] bg-[#e2f7ed] text-[#00875a] dark:bg-[#112a20] dark:text-[#3cd070] select-none shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-[15px]">{emp.fullName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{emp.email}</div>
                          </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(activeActionId === emp._id ? null : emp._id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#162722] text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer border-none bg-transparent"
                          title="Options"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {activeActionId === emp._id && (
                          <div className="absolute right-6 top-10 w-44 bg-white dark:bg-[#111c18] border border-[#e2eae7] dark:border-[#1a2d29] rounded-xl shadow-lg z-50 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => handleView(emp._id)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-gray-50 dark:hover:bg-[#162722] transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                            >
                              <Eye size={13} />
                              <span>View profile</span>
                            </button>
                            <button
                              onClick={() => handleEdit(emp._id)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-gray-50 dark:hover:bg-[#162722] transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                            >
                              <Edit3 size={13} />
                              <span>Edit details</span>
                            </button>
                            <div className="border-t border-[#eceae3] dark:border-[#1a2d29] my-1"></div>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="w-full px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                            >
                              <Trash2 size={13} />
                              <span>Deactivate</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HREmployees;
