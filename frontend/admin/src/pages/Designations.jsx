import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  GraduationCap, Users, CheckCircle2, Search, Edit3, Trash2,
  Eye, RefreshCw, X, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, Award
} from 'lucide-react';

const INITIAL_DESIGNATIONS = [
  { id: '1', name: 'Senior Software Engineer', department: 'Engineering', employees: 14, status: 'Active', desc: 'Leads architecture, frontend/backend engineering nodes, and dev pipelines.', created: '2026-01-10' },
  { id: '2', name: 'Product Designer', department: 'Design', employees: 8, status: 'Active', desc: 'Coordinates UI flow components, wireframes, and design guidelines.', created: '2026-02-15' },
  { id: '3', name: 'Account Executive', department: 'Sales', employees: 12, status: 'Active', desc: 'Handles client lifecycle, onboarding, and outbound pipeline.', created: '2026-03-01' },
  { id: '4', name: 'HR Manager', department: 'HR', employees: 4, status: 'Active', desc: 'Directs recruiting audits, employee benefits, and payroll sync.', created: '2026-01-15' },
  { id: '5', name: 'SRE Lead', department: 'Engineering', employees: 6, status: 'Active', desc: 'Maintains Docker containers, Kubernetes deployments, and cloud networks.', created: '2026-04-12' },
  { id: '6', name: 'Marketing Specialist', department: 'Marketing', employees: 10, status: 'Active', desc: 'Coordinates SEO metrics, social campaigns, and newsletter releases.', created: '2026-05-18' }
];

export default function Designations() {
  const [loading, setLoading] = useState(true);
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDesigId, setSelectedDesigId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewedDesig, setViewedDesig] = useState(null);

  const [formState, setFormState] = useState({
    name: '', department: 'Engineering', status: 'Active', desc: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get('/api/employees', config).catch(() => ({ data: [] })),
        axios.get('/api/departments', config).catch(() => ({ data: [] }))
      ]);

      const emps = Array.isArray(empRes.data) ? empRes.data : [];
      
      // Map designations dynamically
      const desigMap = {};
      emps.forEach(emp => {
        const desig = emp.position || emp.designation || 'Specialist';
        const dept = emp.department?.name || emp.department || 'Operations';
        if (!desigMap[desig]) {
          desigMap[desig] = {
            id: emp._id,
            name: desig,
            department: dept,
            employees: 0,
            status: 'Active',
            desc: `${desig} organizational node.`,
            created: '2026-06-01'
          };
        }
        desigMap[desig].employees += 1;
      });

      const mappedList = Object.values(desigMap);
      if (mappedList.length > 0) {
        setDesignations(mappedList);
      } else {
        setDesignations(INITIAL_DESIGNATIONS);
      }
    } catch (err) {
      console.error('Failed to sync designations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormState({ name: '', department: 'Engineering', status: 'Active', desc: '' });
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (desig) => {
    setSelectedDesigId(desig.id);
    setFormState({
      name: desig.name,
      department: desig.department,
      status: desig.status,
      desc: desig.desc
    });
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleOpenView = (desig) => {
    setViewedDesig(desig);
    setShowViewModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete designation "${name}"?`)) {
      setDesignations(designations.filter(d => d.id !== id));
      toast.success(`Designation "${name}" removed`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name) {
      toast.error('Designation Name is required');
      return;
    }

    if (isEditMode) {
      setDesignations(designations.map(d => d.id === selectedDesigId ? { ...d, ...formState } : d));
      toast.success('Designation updated successfully');
    } else {
      const created = {
        ...formState,
        id: String(designations.length + 1),
        employees: 0,
        created: new Date().toISOString().split('T')[0]
      };
      setDesignations([created, ...designations]);
      toast.success('New designation initialized');
    }
    setShowAddModal(false);
  };

  // Filter logic
  const filteredDesignations = designations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || d.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination
  const totalItems = filteredDesignations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDesignations = filteredDesignations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary statistics
  const activeCount = designations.filter(d => d.status === 'Active').length;
  const totalEmployees = designations.reduce((sum, d) => sum + d.employees, 0);

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      {/* ─── TITLE HEADER ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="text-[#00a76b]" size={24} />
            Designations Register
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#829e92] font-semibold mt-1">Configure professional organizational roles, link positions to subdivisions, and map grade bands.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold text-xs transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add Designation</span>
        </button>
      </div>

      {/* ─── SUMMARY CARDS ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Designations', val: designations.length, info: 'Role bands', color: '#00a76b', icon: Award },
          { label: 'Active Positions', val: activeCount, info: 'Active roles', color: '#2563eb', icon: CheckCircle2 },
          { label: 'Total Allocated Roles', val: totalEmployees, info: 'Mapped nodes', color: '#8b5cf6', icon: Users },
          { label: 'Primary Department', val: 'Engineering', info: 'Highest headcount', color: '#f59e0b', icon: GraduationCap }
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col justify-between h-[120px]"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#829e92] uppercase tracking-wider">{card.label}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${card.color}15`, color: card.color }}
              >
                <card.icon size={15} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none mb-1 truncate max-w-[170px]">{card.val}</h3>
              <p className="text-[9px] font-bold text-[#829e92] dark:text-[#527068] uppercase tracking-widest">{card.info}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CONTROLS TOOLBAR ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[20px] p-4 shadow-sm">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search designations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#111c18] border-none text-xs font-semibold rounded-full focus:outline-none focus:ring-1 focus:ring-[#00a76b]/20 text-slate-700 dark:text-[#a3b3af]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal size={14} className="text-slate-400" />
          
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#111c18] text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-250 dark:border-[#1a2d29] focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#111c18] text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-250 dark:border-[#1a2d29] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
          
          <button 
            onClick={fetchData}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-[#1a2d29] hover:bg-gray-50 flex items-center justify-center bg-transparent cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2eae7] dark:border-[#13221e] bg-slate-50 dark:bg-[#111c18]/45">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92]">Role Band</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92]">Respective Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92] text-center">Allocated Members</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92] text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92] text-center">Created Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#829e92] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2eae7] dark:divide-[#13221e]">
              {paginatedDesignations.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#111c18]/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white">
                    <div>
                      <p>{d.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-[220px]">{d.desc}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{d.department}</td>
                  <td className="px-6 py-4 text-xs font-black text-center tabular-nums text-slate-700 dark:text-slate-350">{d.employees}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      d.status === 'Active' ? 'bg-green-105 text-green-700 dark:bg-green-950/20' : 'bg-red-105 text-red-700 dark:bg-red-950/20'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-center font-bold text-slate-400">{d.created}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenView(d)}
                        className="p-1.5 hover:text-[#00a76b] text-slate-400 bg-transparent border-none cursor-pointer"
                        title="View Designation details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 hover:text-blue-500 text-slate-400 bg-transparent border-none cursor-pointer"
                        title="Edit Designation"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id, d.name)}
                        className="p-1.5 hover:text-red-500 text-slate-400 bg-transparent border-none cursor-pointer"
                        title="Delete Designation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#e2eae7] dark:border-[#13221e] bg-slate-50/20 dark:bg-[#111c18]/10 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} roles</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#1a2d29] flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#1a2d29] flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: CREATE/EDIT DESIGNATION ────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] w-full max-w-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#eceae3] dark:border-[#1a2d29]">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{isEditMode ? 'Modify Designation Role' : 'Initialize Designation Role'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">Designation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead SRE Architect"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">Respective Department</label>
                <select
                  value={formState.department}
                  onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">Active Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">Functional Role Description</label>
                <textarea
                  placeholder="Provide scope guidelines..."
                  value={formState.desc}
                  onChange={(e) => setFormState({ ...formState, desc: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-[#1a2d29] hover:bg-slate-50 rounded-full font-bold bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold cursor-pointer border-none"
                >
                  {isEditMode ? 'Save Modifications' : 'Initialize Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW DETAILS ─────────────────────────── */}
      {showViewModal && viewedDesig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] w-full max-w-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#eceae3] dark:border-[#1a2d29]">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{viewedDesig.name} Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider">Respective Department</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">{viewedDesig.department}</span>
              </div>

              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider">Status Node</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 ${
                  viewedDesig.status === 'Active' ? 'bg-green-105 text-green-700 dark:bg-green-950/20' : 'bg-red-105 text-red-700 dark:bg-red-950/20'
                }`}>{viewedDesig.status}</span>
              </div>

              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider">Active Headcount</span>
                <span className="text-sm font-black text-slate-850 dark:text-slate-200 mt-1 block tabular-nums">{viewedDesig.employees} Mapped Employees</span>
              </div>

              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider">Functional Role Description</span>
                <p className="text-slate-500 dark:text-[#829e92] mt-1.5 font-medium leading-relaxed">{viewedDesig.desc}</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#eceae3] dark:border-[#1a2d29]">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 bg-[#00a76b] text-white rounded-full font-bold cursor-pointer border-none"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
