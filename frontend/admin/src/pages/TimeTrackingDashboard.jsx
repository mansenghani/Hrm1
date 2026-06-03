/**
 * ============================================================
 * TIME ENGINE v2 — FRONTEND DISPLAY ONLY
 * ============================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Play, Pause, Square, Clock, Zap, TrendingUp, BarChart3,
  Calendar as CalendarIcon, Search, ArrowRight, Timer,
  ChevronLeft, ChevronRight, Activity, AlertCircle, Plus, ShieldCheck, Target, Send, X, RefreshCw, MessageSquare, FileText, Download, Calendar, Users, Filter, ChevronDown, UserCheck, ClipboardList, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailView from '../components/TaskDetailView';

const API_BASE = '/api/time';
const POLL_INTERVAL_MS = 1000;
const HEARTBEAT_INTERVAL_MS = 10000;

// Robust Date Formatter for Manual Comparison
const getYYYYMMDD = (dateInput) => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) { return ''; }
};

// ABSOLUTE ASSET NORMALIZER
const getEvidenceUrl = (file) => {
  if (!file) return '';
  if (file instanceof File) return URL.createObjectURL(file);
  
  // Check all possible database field names
  const rawUrl = file.fileUrl || file.url || file.path || '';
  if (!rawUrl) return '';
  
  // Normalize backslashes to forward slashes for browser compatibility
  const normalizedUrl = rawUrl.replace(/\\/g, '/');
  
  // If it's already an absolute URL or has a leading slash, use it
  if (normalizedUrl.startsWith('http') || normalizedUrl.startsWith('/')) {
    return normalizedUrl;
  }
  
  // Otherwise, ensure it points to the root uploads directory
  return `/${normalizedUrl}`;
};

const formatTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const formatMinutes = (seconds) => `${Math.floor((seconds || 0) / 60)}m`;

const TimeTrackingDashboard = ({ user: propUser, socket }) => {
  const [activeTime, setActiveTime]       = useState(0);
  const [idleTime, setIdleTime]           = useState(0);
  const [inactivityCount, setInactivityCount] = useState(0);
  const [status, setStatus]               = useState(null);
  const [isRunning, setIsRunning]         = useState(false);
  const [isIdle, setIsIdle]               = useState(false);

  // Identity extraction for role-based visibility
  const userRole = sessionStorage.getItem('role')?.toLowerCase() || 'employee';
  const isHigherRole = userRole === 'admin' || userRole === 'hr' || userRole === 'manager';
  
  // Attempt to get user info to identify "My Tasks"
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const today = getYYYYMMDD(new Date());
  const [viewDate, setViewDate]           = useState(today);
  const [registryDate, setRegistryDate]   = useState(today); 
  
  // Default filter to 'Employee' for employee role, otherwise 'All'
  const [roleFilter, setRoleFilter]       = useState(userRole === 'employee' ? 'Employee' : 'All'); 
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Custom Date Picker states and refs
  const [showPersonalCalendar, setShowPersonalCalendar] = useState(false);
  const [showRegistryCalendar, setShowRegistryCalendar] = useState(false);
  const [showViewCalendar, setShowViewCalendar] = useState(false);
  const [personalCalendarMonth, setPersonalCalendarMonth] = useState(new Date());
  const [registryCalendarMonth, setRegistryCalendarMonth] = useState(new Date());
  const [viewCalendarMonth, setViewCalendarMonth] = useState(new Date());
  const personalCalendarRef = useRef(null);
  const registryCalendarRef = useRef(null);
  const viewCalendarRef = useRef(null);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= numDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  useEffect(() => {
    if (registryDate) {
      const parsedDate = new Date(registryDate);
      if (!isNaN(parsedDate.getTime())) {
        setPersonalCalendarMonth(parsedDate);
        setRegistryCalendarMonth(parsedDate);
      }
    }
  }, [registryDate]);

  useEffect(() => {
    if (viewDate) {
      const parsedDate = new Date(viewDate);
      if (!isNaN(parsedDate.getTime())) {
        setViewCalendarMonth(parsedDate);
      }
    }
  }, [viewDate]);

  const [currentDate, setCurrentDate]     = useState(new Date());
  const [pulseFilter, setPulseFilter]     = useState('30days');
  const [summary, setSummary]             = useState({
    stats: { active: 0, idle: 0, total: 0, productivity: 0 },
    logs: [], chartData: []
  });
  const [tasks, setTasks]                 = useState([]);
  const [showQuickAdd, setShowQuickAdd]   = useState(false);
  const [quickTask, setQuickTask]         = useState({ title: '', description: '' });
  const [isSyncing, setIsSyncing]         = useState(false);
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [statusNote, setStatusNote] = useState({ taskId: null, nextStatus: null, note: '' });
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailView, setShowTaskDetailView] = useState(false);

  const heartbeatRef  = useRef(null);
  const pollRef       = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const navigate = useNavigate();

  const getAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (personalCalendarRef.current && !personalCalendarRef.current.contains(event.target)) {
        setShowPersonalCalendar(false);
      }
      if (registryCalendarRef.current && !registryCalendarRef.current.contains(event.target)) {
        setShowRegistryCalendar(false);
      }
      if (viewCalendarRef.current && !viewCalendarRef.current.contains(event.target)) {
        setShowViewCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal Gallery State
  const [previewGallery, setPreviewGallery] = useState({ items: [], index: 0 });

  const applyServerState = useCallback((data) => {
    if (!data?.hasActiveSession) {
      setStatus(null); setIsRunning(false); setIsIdle(false);
      setActiveTime(0); setIdleTime(0); setInactivityCount(0);
      return;
    }
    setStatus(data.status);
    setIsRunning(data.isRunning);
    setIsIdle(data.status === 'idle');
    setActiveTime(data.activeTime ?? 0);
    setIdleTime(data.idleTime ?? 0);
    setInactivityCount(data.inactivityCount ?? 0);
  }, []);

  const pollStatus = useCallback(async () => {
    const auth = getAuth();
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/status`, auth);
      applyServerState(res.data);
    } catch (err) { 
      if (err.response && err.response.status === 401) {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
      }
      console.error('[POLL ERROR]', err.message); 
    }
  }, [applyServerState, navigate]);

  const fetchCurrentUser = useCallback(async () => {
    const auth = getAuth();
    if (!auth) return;
    try {
      const res = await axios.get('/api/auth/me', auth);
      if (res.data) setCurrentUser(res.data);
    } catch (err) { console.error('User fetch failed'); }
  }, []);

  const fetchSummary = useCallback(async (date = viewDate, timeRange = pulseFilter) => {
    const auth = getAuth();
    if (!auth) return;
    try {
      setIsSyncing(true);
      const res = await axios.get(`${API_BASE}/summary?date=${date}&timeRange=${timeRange}`, auth);
      if (res.data) setSummary(res.data);
    } catch (err) { 
      if (err.response && err.response.status === 401) {
        sessionStorage.clear(); localStorage.clear();
        navigate('/login');
      }
      console.error('[SUMMARY ERROR]', err.message); 
    } finally {
      setIsSyncing(false);
    }
  }, [viewDate, pulseFilter, navigate]);

  const fetchRegistryTasks = useCallback(async (date = registryDate) => {
    const auth = getAuth();
    if (!auth) return;
    try {
      setIsSyncing(true);
      const res = await axios.get(`/api/tasks?date=${date}`, auth);
      if (res.data.success) {
        setTasks(res.data.data);
        setCurrentPage(1); // Reset to page 1 on date change
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        sessionStorage.clear(); localStorage.clear();
        navigate('/login');
      }
      console.error('[REGISTRY FETCH ERROR]', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [registryDate, navigate]);

  const handleStatusClick = (taskId, nextStatus) => {
    if (nextStatus === 'Completed' || nextStatus === 'Review' || nextStatus === 'Need to Improve') {
      updateTaskStatus(taskId, nextStatus, 'Mission Milestone Reached');
    } else {
      setStatusNote({ taskId, nextStatus, note: '' });
    }
  };

  const updateTaskStatus = async (id, newStatus, note) => {
    const auth = getAuth();
    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus, progressNote: note }, auth);
      toast.success('Updated successfully');
      setStatusNote({ taskId: null, nextStatus: null, note: '' });
      fetchRegistryTasks(registryDate);
    } catch (err) { toast.error('Update failed'); }
  };

  const handleAction = async (action) => {
    const auth = getAuth();
    if (!auth) return;
    try {
      await axios.post(`${API_BASE}/${action}`, {}, auth);
      await pollStatus();
      await fetchSummary();
      toast.success(`Session ${action === 'start' ? 'Initialized' : action.toUpperCase()}`);
    } catch (err) { 
      if (err.response && err.response.status === 401) {
        sessionStorage.clear();
        localStorage.clear();
        toast.error('Session expired. Redirecting to login...');
        navigate('/login');
      } else {
        toast.error(`Action Failed: ${err.message}`); 
      }
    }
  };

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const res = await axios.post('/api/tasks', { ...quickTask, date: registryDate }, auth);
      toast.success('Quick Task Injected');
      setQuickTask({ title: '', description: '' });
      setShowQuickAdd(false);
      setTimeout(() => fetchRegistryTasks(registryDate), 1000);
    } catch (err) { toast.error('Injection Failed'); }
  };

  const openGallery = (attachments, startIndex = 0) => {
    if (!attachments || attachments.length === 0) return;

    const galleryItems = attachments.map(file => {
      const url = getEvidenceUrl(file);
      const fileType = file.fileType || file.type || '';
      const fileName = file.fileName || file.name || 'Evidence';
      const isImage = (fileType.startsWith('image/')) || (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i));
      
      return { url, name: fileName, isImage };
    });
    
    setPreviewGallery({ items: galleryItems, index: startIndex });
  };

  useEffect(() => {
    pollStatus(); fetchSummary(); fetchRegistryTasks(registryDate); fetchCurrentUser();
    const pollId = setInterval(pollStatus, POLL_INTERVAL_MS);
    heartbeatRef.current = setInterval(() => {
      const auth = getAuth();
      if (!auth || !isRunning) return;
      const type = Date.now() - lastActivityRef.current < 60000 ? 'heartbeat' : 'idle';
      axios.post(`${API_BASE}/activity`, { type }, auth).catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);
    
    const taskInterval = setInterval(() => fetchRegistryTasks(registryDate), 30000);
    
    return () => { 
      clearInterval(pollId); 
      clearInterval(heartbeatRef.current); 
      clearInterval(taskInterval);
    };
  }, [isRunning, fetchSummary, fetchRegistryTasks, pollStatus, registryDate, fetchCurrentUser]);

  useEffect(() => { fetchSummary(viewDate, pulseFilter); }, [viewDate, pulseFilter, fetchSummary]);
  useEffect(() => { fetchRegistryTasks(registryDate); }, [registryDate, fetchRegistryTasks]);

  // Personal vs Global Tasks
  const myTasks = tasks.filter(task => task.employeeId === currentUser?._id || task.employeeName === currentUser?.fullName);
  
  // Role Filtering Logic for Global Registry
  const filteredTasks = tasks.filter(task => {
    if (userRole === 'hr' && task.employeeRole?.toLowerCase() === 'hr') {
      return false;
    }
    if (roleFilter === 'All') return true;
    return task.employeeRole?.toLowerCase() === roleFilter.toLowerCase();
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const roleOptions = [
    { label: 'All Roles', value: 'All' },
    ...(userRole === 'admin' ? [
      { label: 'HR', value: 'HR' },
      { label: 'Manager', value: 'Manager' }
    ] : []),
    ...(userRole === 'hr' ? [
      { label: 'Manager', value: 'Manager' }
    ] : []),
    { label: 'Employee', value: 'Employee' }
  ];

  return (
    <div className="min-h-screen bg-[#fffdf9] p-4 md:p-8 font-['Outfit'] text-[#201515]">
      {/* NUCLEAR INVISIBLE SCROLL PROTOCOL — ABSOLUTE PURGE */}
      <style>{`
        .absolute-invisible-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; background: transparent !important; }
        .absolute-invisible-scroll::-webkit-scrollbar-track { background: transparent !important; border: none !important; }
        .absolute-invisible-scroll::-webkit-scrollbar-thumb { background: transparent !important; border: none !important; }
        .absolute-invisible-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* Mission Intelligence Dossier — Full View Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[9999] bg-[#201515]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[5px] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Dossier Header */}
            <div className="bg-[#201515] p-8 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[5px] bg-[#ff4f00] flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">Mission <span className="text-[#ff4f00]">Dossier.</span></h2>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-[#ff4f00] uppercase tracking-[0.3em]">Sector: Registry Entry</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">ID: {selectedTask._id?.substring(selectedTask._id.length - 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="w-12 h-12 rounded-[5px] bg-white/5 text-white hover:bg-[#ff4f00] transition-all flex items-center justify-center border-none cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 absolute-invisible-scroll bg-[#fffdf9]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Strategic Intel */}
                <div className="lg:col-span-2 space-y-10">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#939084] mb-4 block">Strategic Objective</label>
                    <h1 className="text-4xl font-black text-[#201515] tracking-tight leading-tight">{selectedTask.title}</h1>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#939084] mb-4 block">Objective Protocol (Description)</label>
                    <div className="bg-white border border-[#eceae3] p-8 rounded-[5px] shadow-sm">
                      <p className="text-[16px] font-medium text-[#201515] leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  </div>

                  {selectedTask.attachments?.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#939084] mb-4 block">Visual Intelligence (Evidence)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedTask.attachments.map((file, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => openGallery(selectedTask.attachments, idx)}
                            className="aspect-square rounded-[5px] bg-[#f8f9fa] border border-[#eceae3] overflow-hidden group hover:border-[#ff4f00]/50 transition-all cursor-pointer shadow-sm"
                          >
                            {((file.fileName || file.path || '').match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) || (file.fileType?.startsWith('image/')) ? (
                              <img src={getEvidenceUrl(file)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <FileText size={32} className="text-[#ff4f00] mb-2" />
                                <span className="text-[9px] font-black text-[#201515] text-center line-clamp-1 uppercase">{file.fileName || 'Doc'}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-8">
                  <div className="bg-[#201515] rounded-[5px] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4f00]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff4f00] mb-6 block relative">Operative Assigned</label>
                    <div className="flex items-center gap-4 mb-8 relative">
                      <div className="w-14 h-14 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] text-[18px] font-black uppercase">
                        {selectedTask.employeeName?.substring(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="text-[18px] font-black tracking-tight">{selectedTask.employeeName || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-[#ff4f00] uppercase tracking-widest">{selectedTask.employeeRole || 'Operative'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-white/10 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status Code</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTask.status === 'Completed' ? 'text-emerald-400' : 'text-[#ff4f00]'}`}>{selectedTask.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date Logged</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{selectedTask.date || 'TBD'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTask.progressNote && (
                    <div className="bg-white border border-[#eceae3] p-8 rounded-[5px] shadow-sm relative">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#939084] mb-4 block">Latest Progress Intel</label>
                      <div className="w-8 h-1 bg-[#ff4f00] mb-4"></div>
                      <p className="text-[14px] font-medium text-[#201515] italic leading-relaxed">"{selectedTask.progressNote}"</p>
                      <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest mt-6 flex items-center gap-2">
                        <Clock size={12} className="text-[#ff4f00]" /> TRANSMITTED VIA SECURE CHANNEL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Status Note Terminal */}
      {statusNote.taskId && (
        <div className="fixed inset-0 z-[10000] bg-[#201515]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[5px] p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setStatusNote({ taskId: null, nextStatus: null, note: '' })} 
                className="absolute top-6 right-6 text-[#939084] hover:text-[#ff4f00] border-none bg-transparent cursor-pointer"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-[5px] bg-[#ff4f00]/10 flex items-center justify-center text-[#ff4f00]">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">Status <span className="text-[#ff4f00]">Report.</span></h2>
                  <p className="text-[10px] font-bold text-[#939084] uppercase tracking-[0.2em]">Required for transition to {statusNote.nextStatus}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#939084] mb-3 block ml-1">Progress Intelligence</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-5 text-[#939084]/60" size={18} />
                      <textarea 
                        autoFocus
                        placeholder="What is the current status of this objective?"
                        className="w-full h-40 pl-12 pr-5 pt-4 bg-white rounded-[5px] text-[15px] font-medium focus:outline-none border border-[#eceae3] focus:border-[#ff4f00]/40 shadow-sm resize-none leading-relaxed" 
                        value={statusNote.note} 
                        onChange={e => setStatusNote({...statusNote, note: e.target.value})} 
                      />
                    </div>
                 </div>
                 <button 
                   onClick={() => updateTaskStatus(statusNote.taskId, statusNote.nextStatus, statusNote.note)}
                   disabled={!statusNote.note.trim()}
                   className="w-full h-14 bg-[#201515] hover:bg-[#ff4f00] text-white rounded-[5px] font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                 >
                    SEND UPDATE <Send size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Universal Multi-Image Lightbox */}
      {previewGallery.items.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-[#201515]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setPreviewGallery({ items: [], index: 0 })} className="absolute top-6 right-6 w-12 h-12 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all border-none cursor-pointer z-[10001]">
            <X size={24} />
          </button>
          
          {previewGallery.items.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewGallery(prev => ({ ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length })) }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-[#ff4f00] transition-all border-none cursor-pointer z-[10001]"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewGallery(prev => ({ ...prev, index: (prev.index + 1) % prev.items.length })) }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-[#ff4f00] transition-all border-none cursor-pointer z-[10001]"
              >
                <ChevronRight size={32} />
              </button>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 rounded-[5px] text-white text-[12px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                {previewGallery.index + 1} / {previewGallery.items.length}
              </div>
            </>
          )}

          <div className="max-w-full max-h-[85vh] flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
            {previewGallery.items[previewGallery.index].isImage ? (
              <img 
                src={previewGallery.items[previewGallery.index].url} 
                alt="Full Preview" 
                className="max-w-full max-h-[80vh] object-contain rounded-[5px] shadow-2xl ring-1 ring-white/10"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/600x400/201515/ff4f00?text=IMAGE+LOST+IN+MATRIX';
                }}
              />
            ) : (
              <div className="w-[400px] aspect-video bg-white/5 rounded-[5px] border border-white/10 flex flex-col items-center justify-center p-10 text-center gap-6 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-[#ff4f00]"><FileText size={40} /></div>
                <div>
                  <p className="text-white text-[18px] font-black tracking-tight line-clamp-1">{previewGallery.items[previewGallery.index].name}</p>
                  <p className="text-white/40 text-[12px] font-bold uppercase tracking-widest mt-1">Non-Visual Document detected</p>
                </div>
                <a 
                  href={previewGallery.items[previewGallery.index].url} 
                  download 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 bg-[#ff4f00] text-white rounded-[5px] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 no-underline hover:scale-105 transition-all"
                >
                  DOWNLOAD FILE <Download size={18} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {showQuickAdd && (
        <div className="fixed inset-0 z-[9999] bg-[#201515]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[5px] p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowQuickAdd(false)} className="absolute top-6 right-6 text-[#939084] hover:text-[#ff4f00] border-none bg-transparent cursor-pointer"><X size={24} /></button>
              <div className="flex items-center gap-3 mb-8"><Zap size={24} className="text-[#ff4f00]" /><h2 className="text-2xl font-black tracking-tighter uppercase">Quick <span className="text-[#ff4f00]">Injection</span></h2></div>
              <form onSubmit={handleQuickAddTask} className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#939084] mb-2 block">Task Objective</label>
                   <div className="relative">
                     <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]/60" size={18} />
                     <input autoFocus required type="text" className="w-full h-12 pl-12 pr-5 bg-white rounded-[5px] text-[14px] font-bold focus:outline-none border border-[#eceae3] focus:border-[#ff4f00]/40 shadow-sm" value={quickTask.title} onChange={e => setQuickTask({...quickTask, title: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#939084] mb-2 block">Quick Note</label>
                   <div className="relative">
                     <FileText className="absolute left-4 top-5 text-[#939084]/60" size={18} />
                     <textarea required className="w-full h-32 pl-12 pr-5 pt-4 bg-white rounded-[5px] text-[14px] font-medium focus:outline-none border border-[#eceae3] focus:border-[#ff4f00]/40 shadow-sm resize-none" value={quickTask.description} onChange={e => setQuickTask({...quickTask, description: e.target.value})} />
                   </div>
                 </div>
                 <button type="submit" className="zap-btn zap-btn-orange w-full h-14 !px-0 rounded-[5px]">Inject Into Matrix</button>
              </form>
           </div>
        </div>
      )}

      {/* Universal Multi-Image Lightbox */}
      {previewGallery.items.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-[#201515]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setPreviewGallery({ items: [], index: 0 })} className="absolute top-6 right-6 w-12 h-12 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all border-none cursor-pointer z-[10001]">
            <X size={24} />
          </button>
          
          {previewGallery.items.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewGallery(prev => ({ ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length })) }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-[#ff4f00] transition-all border-none cursor-pointer z-[10001]"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewGallery(prev => ({ ...prev, index: (prev.index + 1) % prev.items.length })) }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[5px] bg-white/10 text-white flex items-center justify-center hover:bg-[#ff4f00] transition-all border-none cursor-pointer z-[10001]"
              >
                <ChevronRight size={32} />
              </button>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 rounded-[5px] text-white text-[12px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                {previewGallery.index + 1} / {previewGallery.items.length}
              </div>
            </>
          )}

          <div className="max-w-full max-h-[85vh] flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
            {previewGallery.items[previewGallery.index].isImage ? (
              <img 
                src={previewGallery.items[previewGallery.index].url} 
                alt="Full Preview" 
                className="max-w-full max-h-[80vh] object-contain rounded-[5px] shadow-2xl ring-1 ring-white/10"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/600x400/201515/ff4f00?text=IMAGE+LOST+IN+MATRIX';
                }}
              />
            ) : (
              <div className="w-[400px] aspect-video bg-white/5 rounded-[5px] border border-white/10 flex flex-col items-center justify-center p-10 text-center gap-6 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-[#ff4f00]"><FileText size={40} /></div>
                <div>
                  <p className="text-white text-[18px] font-black tracking-tight line-clamp-1">{previewGallery.items[previewGallery.index].name}</p>
                  <p className="text-white/40 text-[12px] font-bold uppercase tracking-widest mt-1">Non-Visual Document detected</p>
                </div>
                <a 
                  href={previewGallery.items[previewGallery.index].url} 
                  download 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 bg-[#ff4f00] text-white rounded-[5px] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 no-underline hover:scale-105 transition-all"
                >
                  DOWNLOAD FILE <Download size={18} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}


      {showCreateTaskModal && <CreateTaskModal onClose={() => setShowCreateTaskModal(false)} />}
      {showTaskDetailView && <TaskDetailView onClose={() => setShowTaskDetailView(false)} />}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Row: Session Telemetry & Calendar (Equal Height) */}
        <div className="grid grid-cols-12 gap-8 items-stretch">
          <div className="col-span-12 lg:col-span-8">
            {/* Timer Card */}
            <div className="bg-white border border-[#c5c0b1] rounded-[5px] p-10 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4f00]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isRunning && !isIdle ? 'bg-[#24a148] animate-pulse' : 'bg-[#c5c0b1]'}`} />
                    <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#939084]">Session Telemetry</h2>
                  </div>
                  <h1 className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums text-[#201515]">{formatTime(activeTime)}</h1>
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    {isIdle ? (
                      <div className="bg-[#fff4f0] border border-[#ffb38a] rounded-[5px] p-4 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><AlertCircle size={16} className="text-[#ff4f00]" /><span className="text-[11px] font-black text-[#ff4f00] uppercase tracking-widest">Inactivity Detected</span></div>
                          <span className="text-[11px] font-black bg-[#ff4f00] text-white px-2 py-0.5 rounded-[5px] uppercase tracking-widest">Paused</span>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                           <div className="flex flex-col"><span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest">Idle Time</span><span className="text-[16px] font-black text-[#201515]">{formatTime(idleTime)}</span></div>
                           <div className="flex flex-col items-end"><span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest text-[#ff4f00]">Inactivity Events</span><span className="text-[20px] font-black text-[#ff4f00]">{inactivityCount}×</span></div>
                        </div>
                      </div>
                    ) : isRunning && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-[#24a148]/10 border border-[#24a148] rounded-[5px]">
                        <Activity size={14} className="text-[#24a148]" /><span className="text-[12px] font-black text-[#24a148] uppercase tracking-widest">Operational Pulse Active</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  {!status ? (
                    <button onClick={() => handleAction('start')} className="zap-btn zap-btn-orange h-12 px-8 flex items-center gap-2 rounded-[5px]">START <Play size={16} fill="white" /></button>
                  ) : (
                    <div className="flex flex-row gap-3">
                      {isRunning && !isIdle ? (
                        <button onClick={() => handleAction('pause')} className="zap-btn zap-btn-light h-12 px-6 rounded-[5px]">PAUSE <Pause size={14} /></button>
                      ) : (
                        <button onClick={() => handleAction('resume')} className="zap-btn !bg-[#24a148] !text-white h-12 px-8 rounded-[5px]">RESUME <Play size={14} fill="white" /></button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            {/* Calendar */}
            <div className="bg-[#201515] text-white rounded-[5px] p-8 shadow-xl h-full flex flex-col justify-between">
               <div className="flex justify-between items-center mb-6">
                  <div><h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#ff4f00]">Calendar</h3><p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p></div>
                  <div className="flex gap-4"><button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))} className="p-2 bg-white/5 rounded-full text-white border-none cursor-pointer"><ChevronLeft size={16} /></button><button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))} className="p-2 bg-white/5 rounded-full text-white border-none cursor-pointer"><ChevronRight size={16} /></button></div>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center">
                  {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[8px] font-black text-white/40 mb-3">{d}</div>)}
                  {Array.from({ length: 42 }).map((_, i) => {
                    const d = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
                    if (d <= 0 || d > new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) return <div key={i} />;
                    const dateStr = getYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
                    return <button key={i} onClick={() => setViewDate(dateStr)} className={`h-8 w-8 rounded-full text-[10px] font-black transition-all border-none cursor-pointer ${viewDate === dateStr ? 'bg-[#ff4f00] text-white shadow-lg scale-110' : 'text-white/60 hover:bg-white/10'}`}>{d}</button>;
                  })}
               </div>
            </div>
          </div>
        </div>

        {/* Second Row: Stats/Chart & Recent Nodes */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active', val: formatMinutes(summary.stats.active), icon: Zap, color: 'text-[#24a148]' },
                { label: 'Idle', val: formatMinutes(summary.stats.idle), icon: Clock, color: 'text-[#ff4f00]' },
                { label: 'Total', val: formatMinutes(summary.stats.total), icon: Timer, color: 'text-[#201515]' },
                { label: 'Yield', val: `${summary.stats.productivity}%`, icon: TrendingUp, color: 'text-[#ff4f00]' }
              ].map((card, i) => (
                <div key={i} className="bg-white border border-[#c5c0b1] p-4 rounded-[5px] shadow-sm group hover:border-[#ff4f00] transition-colors">
                  <card.icon size={16} className={`${card.color} mb-4`} /><h4 className="text-2xl font-black text-[#201515] tracking-tighter mb-1">{card.val}</h4><p className="text-[9px] font-black text-[#939084] uppercase tracking-widest">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white border border-[#c5c0b1] rounded-[5px] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#201515]">Historical Pulse</h3>
                <select 
                  value={pulseFilter}
                  onChange={(e) => setPulseFilter(e.target.value)}
                  className="bg-[#f4f2ec] border border-[#c5c0b1] text-[#201515] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[3px] outline-none cursor-pointer"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="h-[250px] w-full focus:outline-none" style={{ outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                  <BarChart data={summary.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none', border: 'none' }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceae3" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#939084' }} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      domain={[0, dataMax => Math.max(10, Math.ceil(dataMax))]} 
                      tickCount={6}
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#939084' }} 
                    />
                    <Tooltip 
                      cursor={false}
                      formatter={(value) => [formatTime(Math.round(value * 3600)), 'Active']}
                      contentStyle={{ borderRadius: '5px', border: 'none', padding: '15px', fontWeight: 900 }} 
                    />
                    <Bar dataKey="active" fill="#ff4f00" radius={[2, 2, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            {/* Recent Logs */}
            <div className="bg-white border border-[#c5c0b1] rounded-[5px] p-8 shadow-sm max-h-[450px] overflow-y-auto scrollbar-hide w-full">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#201515] mb-6">Recent Nodes</h3>
               <div className="space-y-4">
                  {summary.logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#fffdf9] border border-[#eceae3] rounded-[5px] hover:border-[#ff4f00] transition-colors group">
                      <div><p className="text-[16px] font-black text-[#201515] tracking-tighter">{formatTime(log.activeTime)}</p><p className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">{log.date}</p></div>
                      <ArrowRight size={14} className="text-[#c5c0b1] group-hover:text-[#ff4f00] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

      {/* SYMMETRIC PERSONAL COMMAND MATRIX — STABILIZED DIMENSIONS */}
      {/* Hidden per user request: */}
      {false && (isHigherRole || userRole === 'employee') && (
        <div className="mt-12 animate-in slide-in-from-right-8 duration-500">
           <div className="zap-card !bg-[#201515] border-none !p-8 shadow-2xl relative !overflow-visible group rounded-[5px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4f00]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#ff4f00]/10 transition-colors"></div>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[5px] bg-[#ff4f00] flex items-center justify-center text-white shadow-lg shadow-[#ff4f00]/20">
                       <UserCheck size={24} />
                    </div>
                    <div>
                       <h3 className="text-[18px] font-black text-white uppercase tracking-tighter">My Strategic Objectives</h3>
                       <p className="text-[10px] font-bold text-[#ff4f00] uppercase tracking-[0.3em]">Direct Command Console — {registryDate}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <span className="bg-white/10 text-white text-[9px] font-black px-3 py-2.5 rounded-[5px] uppercase tracking-widest leading-none shrink-0">{myTasks.length} NODES</span>
                      <div className="relative" ref={personalCalendarRef}>
                        <button
                          type="button"
                          onClick={() => setShowPersonalCalendar(!showPersonalCalendar)}
                          className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-[#ff4f00]/40 rounded-[5px] px-4 h-10 text-[11px] font-black text-white transition-all cursor-pointer uppercase shadow-lg select-none"
                        >
                          <Calendar className="text-[#ff4f00]" size={14} />
                          <span>{formatDateDisplay(registryDate)}</span>
                        </button>

                        {showPersonalCalendar && (
                          <div className="absolute right-0 bottom-full mb-2 w-72 bg-[#201515]/95 backdrop-blur-xl border border-white/10 rounded-[5px] p-4 shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-4">
                              <button
                                type="button"
                                onClick={() => setPersonalCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white transition-colors border-none cursor-pointer"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][personalCalendarMonth.getMonth()]} {personalCalendarMonth.getFullYear()}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPersonalCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                disabled={personalCalendarMonth.getFullYear() >= new Date().getFullYear() && personalCalendarMonth.getMonth() >= new Date().getMonth()}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white transition-colors border-none cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>

                            {/* Week Days Header */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                <div key={d} className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                  {d}
                                </div>
                              ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                              {getDaysInMonth(personalCalendarMonth).map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} className="w-8 h-8" />;
                                
                                const dayStr = getYYYYMMDD(day);
                                const isSelected = dayStr === registryDate;
                                const isFuture = dayStr > today;
                                
                                return (
                                  <button
                                    key={dayStr}
                                    type="button"
                                    disabled={isFuture}
                                    onClick={() => {
                                      setRegistryDate(dayStr);
                                      setShowPersonalCalendar(false);
                                    }}
                                    className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-[10px] font-bold transition-all border-none cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/20'
                                        : isFuture
                                        ? 'text-white/10 cursor-not-allowed pointer-events-none'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                  >
                                    {day.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                     <button onClick={() => setShowQuickAdd(true)} className="w-10 h-10 rounded-[5px] bg-white/5 text-white/40 flex items-center justify-center hover:bg-[#ff4f00] hover:text-white transition-all border-none cursor-pointer"><Plus size={20} /></button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {myTasks.length === 0 ? (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-white/10 rounded-[5px] bg-white/5">
                       <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">No Personal Objectives Logged for Today</p>
                       <button onClick={() => setShowQuickAdd(true)} className="mt-4 text-[10px] font-black text-[#ff4f00] uppercase tracking-widest border-none bg-transparent cursor-pointer hover:underline">+ Inject Personal Task</button>
                    </div>
                 ) : myTasks.map(task => (
                    <div 
                        key={task._id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-white/5 border border-white/10 p-6 rounded-[5px] flex flex-col gap-6 group hover:border-[#ff4f00]/50 transition-all shadow-lg hover:shadow-[#ff4f00]/5 h-fit cursor-pointer"
                    >
                        <div className="min-w-0 pr-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                       <div className="w-8 h-8 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] text-[10px] font-black uppercase shrink-0">
                                          {currentUser?.fullName?.substring(0, 2) || 'ME'}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-[10px] font-black text-white truncate leading-none uppercase tracking-tighter">{currentUser?.fullName || 'COMMANDER'}</p>
                                          <span className="text-[8px] font-black uppercase tracking-widest mt-1 inline-block text-amber-400">
                                             {userRole?.toUpperCase() || 'OPERATIVE'}
                                          </span>
                                       </div>
                                    </div>

                                    <p className="text-[18px] font-black text-white truncate tracking-tight">{task.title}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'Review' ? 'bg-[#ff4f00]' : task.status === 'Need to Improve' ? 'bg-rose-500 animate-pulse' : task.status === 'Ongoing' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'Need to Improve' ? 'text-rose-400' : 'text-white/40'}`}>
                                        {task.status === 'Review' ? 'UNDER REVIEW' : task.status}
                                      </span>
                                    </div>
                                </div>

                                {task.attachments?.length > 0 && (
                                    <div className="flex gap-2">
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); openGallery(task.attachments, 0); }}
                                            className="w-14 h-14 rounded-[5px] border-2 border-white/10 overflow-hidden bg-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-110 hover:border-[#ff4f00]/50 shadow-2xl relative group"
                                        >
                                            {((task.attachments[0].fileName || task.attachments[0].path || '').match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) || (task.attachments[0].fileType?.startsWith('image/')) ? (
                                                <img 
                                                    src={getEvidenceUrl(task.attachments[0])} 
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/201515/ff4f00?text=LOST'; }}
                                                />
                                            ) : (
                                                <FileText size={18} className="text-white/40 group-hover:text-[#ff4f00] transition-colors" />
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white">{task.attachments.length > 1 ? `+${task.attachments.length}` : 'VIEW'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                      {/* PERSONAL STATUS COMMANDS — PENDING, ONGOING, REVIEW ONLY */}
                      <div className="grid grid-cols-3 gap-2 w-full">
                          {[
                              { s: 'Pending', c: 'bg-amber-500' },
                              { s: 'Ongoing', c: 'bg-blue-500' },
                              { s: 'Review', c: 'bg-[#ff4f00]' }
                          ].map((btn, idx) => (
                              <button 
                                  key={btn.s}
                                  onClick={(e) => { e.stopPropagation(); task._id && handleStatusClick(task._id, btn.s); }}
                                  disabled={!task._id}
                                  className={`h-9 px-2 rounded-[5px] text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-1 shadow-lg ${task.status === btn.s ? btn.c + ' text-white ring-2 ring-white/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                              >
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === btn.s ? 'bg-white' : btn.c}`}></div>
                                  <span>{btn.s}</span>
                              </button>
                          ))}
                      </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Registry Table */}
      <div className="mt-12 bg-white border border-[#c5c0b1] rounded-[5px] overflow-hidden shadow-xl">
        <div className="p-8 bg-[#eceae3] border-b border-[#c5c0b1] flex flex-col md:flex-row justify-between items-center gap-6">
           <div><h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#201515]">System Registry</h3><p className="text-[9px] font-bold text-[#ff4f00] uppercase tracking-widest mt-1">Filtered: {viewDate}</p></div>
           <div className="flex gap-4">
              <div className="relative" ref={viewCalendarRef}>
                <button
                  type="button"
                  onClick={() => setShowViewCalendar(!showViewCalendar)}
                  className="flex items-center gap-3 bg-white border border-[#c5c0b1] hover:border-[#ff4f00]/40 rounded-[5px] px-4 h-10 text-[11px] font-black text-[#201515] transition-all cursor-pointer uppercase shadow-sm select-none"
                >
                  <Calendar className="text-[#ff4f00]" size={14} />
                  <span>{formatDateDisplay(viewDate)}</span>
                </button>

                {showViewCalendar && (
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-white/95 backdrop-blur-xl border border-[#c5c0b1] rounded-[5px] p-4 shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setViewCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="p-1.5 bg-[#eceae3]/50 hover:bg-[#eceae3] rounded text-[#201515] transition-colors border-none cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#201515]">
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][viewCalendarMonth.getMonth()]} {viewCalendarMonth.getFullYear()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        disabled={viewCalendarMonth.getFullYear() >= new Date().getFullYear() && viewCalendarMonth.getMonth() >= new Date().getMonth()}
                        className="p-1.5 bg-[#eceae3]/50 hover:bg-[#eceae3] rounded text-[#201515] transition-colors border-none cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} className="text-[8px] font-black text-[#939084] uppercase tracking-widest">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(viewCalendarMonth).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="w-8 h-8" />;
                        
                        const dayStr = getYYYYMMDD(day);
                        const isSelected = dayStr === viewDate;
                        const isFuture = dayStr > today;
                        
                        return (
                          <button
                            key={dayStr}
                            type="button"
                            disabled={isFuture}
                            onClick={() => {
                              setViewDate(dayStr);
                              setShowViewCalendar(false);
                            }}
                            className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-[10px] font-bold transition-all border-none cursor-pointer ${
                              isSelected
                                ? 'bg-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/20'
                                : isFuture
                                ? 'text-[#c5c0b1] cursor-not-allowed pointer-events-none'
                                : 'text-[#36342e] hover:bg-[#eceae3] hover:text-[#201515]'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#939084]" size={14} /><input type="text" placeholder="Search..." className="pl-10 pr-4 h-10 bg-white border border-[#c5c0b1] rounded-[5px] text-[11px] font-black text-[#201515] focus:outline-none focus:border-[#ff4f00] w-48 shadow-sm" /></div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">{['Node','Date','Active','Idle','Status'].map(h => <th key={h} className="px-8 py-5 text-[9px] font-black text-[#939084] uppercase tracking-[0.2em]">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#eceae3]">
              {summary.logs.map((log, i) => (
                <tr key={i} className="hover:bg-[#fffdf9] transition-colors group">
                  <td className="px-8 py-6 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-[#201515] flex items-center justify-center text-white font-black text-[10px]">{i+1}</div><div><div className="text-[14px] font-black text-[#201515]">Pulse-{i}</div><div className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">{log.date}</div></div></td>
                  <td className="px-8 py-6 text-[11px] font-black uppercase">{log.date}</td>
                  <td className="px-8 py-6"><div className="text-[14px] font-black text-[#201515] tabular-nums">{formatTime(log.activeTime)}</div><div className="text-[8px] font-bold text-[#24a148] uppercase tracking-widest">Active</div></td>
                  <td className="px-8 py-6"><div className="text-[14px] font-black text-[#ff4f00] tabular-nums">{formatTime(log.idleTime)}</div><div className="text-[8px] font-bold text-[#939084] uppercase tracking-widest">Idle</div></td>
                  <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-[5px] text-[8px] font-black uppercase tracking-widest ${log.status === 'active' ? 'bg-[#24a148]/10 text-[#24a148]' : 'bg-[#939084]/10 text-[#939084]'}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MISSION REGISTRY — COMMAND FEEDBACK LOOP ENFORCED (RESTRICTED TO HIGHER ROLES) */}
      {/* Hidden per user request: */}
      {false && isHigherRole && (
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="zap-card !bg-[#201515] border-none !px-8 !pt-6 !pb-5 flex flex-col gap-4 shadow-2xl rounded-[5px] min-h-[680px]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3"><ShieldCheck size={14} className="text-[#ff4f00]" /> Mission Registry</h4>
                <span className="bg-[#ff4f00] text-white text-[9px] font-black px-2 py-0.5 rounded-[5px] uppercase tracking-tighter">{filteredTasks.length} Nodes Detected</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* CUSTOM PREMIUM ROLE DROPDOWN — CONDITIONAL VISIBILITY */}
                {userRole !== 'employee' && (
                  <div className="relative" ref={dropdownRef}>
                     <div 
                       onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                       className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[5px] px-5 py-1.5 h-12 cursor-pointer hover:border-[#ff4f00]/40 transition-all min-w-[180px]"
                     >
                        <Users size={16} className="text-[#ff4f00]" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest flex-1">
                           {roleOptions.find(o => o.value === roleFilter)?.label || 'All Roles'}
                        </span>
                        <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                     </div>
                     
                     {showRoleDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#201515] border border-white/10 rounded-[5px] shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                           {roleOptions.map((opt) => (
                              <div 
                                key={opt.value}
                                onClick={() => { setRoleFilter(opt.value); setShowRoleDropdown(false); }}
                                className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${roleFilter === opt.value ? 'bg-[#ff4f00] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                              >
                                 {opt.label}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                )}

                <div className="relative" ref={registryCalendarRef}>
                  <button
                    type="button"
                    onClick={() => setShowRegistryCalendar(!showRegistryCalendar)}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-[#ff4f00]/40 rounded-[5px] px-5 h-12 text-[11px] font-black text-white transition-all cursor-pointer uppercase shadow-lg select-none min-w-[150px]"
                  >
                    <Calendar className="text-[#ff4f00]" size={16} />
                    <span>{formatDateDisplay(registryDate)}</span>
                  </button>

                  {showRegistryCalendar && (
                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-[#201515]/95 backdrop-blur-xl border border-white/10 rounded-[5px] p-4 shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => setRegistryCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white transition-colors border-none cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][registryCalendarMonth.getMonth()]} {registryCalendarMonth.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRegistryCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          disabled={registryCalendarMonth.getFullYear() >= new Date().getFullYear() && registryCalendarMonth.getMonth() >= new Date().getMonth()}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white transition-colors border-none cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Week Days Header */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(registryCalendarMonth).map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} className="w-8 h-8" />;
                          
                          const dayStr = getYYYYMMDD(day);
                          const isSelected = dayStr === registryDate;
                          const isFuture = dayStr > today;
                          
                          return (
                            <button
                              key={dayStr}
                              type="button"
                              disabled={isFuture}
                              onClick={() => {
                                setRegistryDate(dayStr);
                                setShowRegistryCalendar(false);
                              }}
                              className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-[10px] font-bold transition-all border-none cursor-pointer ${
                                isSelected
                                  ? 'bg-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/20'
                                  : isFuture
                                  ? 'text-white/10 cursor-not-allowed pointer-events-none'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => fetchRegistryTasks(registryDate)} className={`p-3 bg-white/5 hover:bg-[#ff4f00]/10 rounded-[5px] text-white/40 hover:text-[#ff4f00] transition-all border border-white/10 hover:border-[#ff4f00] cursor-pointer ${isSyncing ? 'animate-spin text-[#ff4f00]' : ''}`}><RefreshCw size={16} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto overflow-x-hidden h-[600px] absolute-invisible-scroll pt-6 px-2 pb-8">
              {paginatedTasks.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-[5px] animate-pulse h-full flex flex-col items-center justify-center">
                    <p className="text-[12px] font-black uppercase tracking-widest text-white/40">No {roleFilter !== 'All' ? roleFilter : ''} missions logged for {registryDate}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 italic">Protocol: Initialize new nodes for this date</p>
                </div>
              ) : paginatedTasks.map(task => (
                <div 
                  key={task._id || (task.title + task.description)} 
                  onClick={() => setSelectedTask(task)}
                  className="bg-white/5 border border-white/10 p-6 rounded-[5px] flex flex-col gap-6 group hover:border-[#ff4f00]/50 transition-all shadow-lg hover:shadow-[#ff4f00]/5 h-fit cursor-pointer"
                >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="w-8 h-8 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] text-[10px] font-black uppercase shrink-0">
                                {task.employeeName?.substring(0, 2) || '??'}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-black text-white truncate leading-none uppercase tracking-tighter">{task.employeeName || 'Unknown Agent'}</p>
                                <span className={`text-[8px] font-black uppercase tracking-widest mt-1 inline-block ${task.employeeRole === 'HR' ? 'text-rose-400' : task.employeeRole === 'Manager' ? 'text-amber-400' : 'text-blue-400'}`}>
                                   {task.employeeRole || 'Infiltrator'}
                                </span>
                             </div>
                          </div>

                          <p className="text-[18px] font-black text-white truncate tracking-tight">{task.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'Review' ? 'bg-[#ff4f00]' : task.status === 'Need to Improve' ? 'bg-rose-500 animate-pulse' : task.status === 'Ongoing' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'Need to Improve' ? 'text-rose-400' : 'text-white/40'}`}>
                              {task.status === 'Review' ? 'UNDER REVIEW' : task.status}
                            </span>
                          </div>
                        </div>

                        {/* UNIVERSAL ATTACHMENT BUTTON */}
                        {task.attachments?.length > 0 && (
                          <div className="flex gap-2">
                            <div 
                              onClick={() => openGallery(task.attachments, 0)}
                              className="w-14 h-14 rounded-[5px] border-2 border-white/10 overflow-hidden bg-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-110 hover:border-[#ff4f00]/50 shadow-2xl relative group"
                            >
                              {((task.attachments[0].fileName || task.attachments[0].path || '').match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) || (task.attachments[0].fileType?.startsWith('image/')) ? (
                                <img 
                                  src={getEvidenceUrl(task.attachments[0])} 
                                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                                  onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = 'https://placehold.co/100x100/201515/ff4f00?text=LOST';
                                  }}
                                />
                              ) : (
                                <FileText size={18} className="text-white/40 group-hover:text-[#ff4f00] transition-colors" />
                              )}
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                                <span className="text-[10px] font-black text-white">{task.attachments.length > 1 ? `+${task.attachments.length}` : 'VIEW'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* STATUS REASON DIALOG */}
                    {statusNote.taskId === task._id ? (
                      <div className="bg-white/10 p-4 rounded-[5px] animate-in zoom-in-95 duration-200">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4f00] mb-2 block flex items-center gap-2"><MessageSquare size={10} /> Reason for {statusNote.nextStatus} Status</label>
                        <textarea 
                          autoFocus
                          required
                          placeholder="Provide a brief update..." 
                          className="w-full h-20 bg-black/20 border border-white/10 rounded-[5px] p-3 text-[12px] text-white focus:outline-none focus:border-[#ff4f00]/50 resize-none mb-3"
                          value={statusNote.note}
                          onChange={e => setStatusNote({...statusNote, note: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setStatusNote({ taskId: null, nextStatus: null, note: '' })} className="flex-1 h-9 rounded-[5px] bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 border-none cursor-pointer">Cancel</button>
                          <button 
                            onClick={() => updateTaskStatus(task._id, statusNote.nextStatus, statusNote.note)}
                            disabled={!statusNote.note.trim()}
                            className="flex-[2] h-9 rounded-[5px] bg-[#ff4f00] text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer disabled:opacity-50"
                          >
                            Confirm Status Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ROLE-BASED COMMAND GRID — TARGETED ACTION PROTOCOL */
                      <div className="grid grid-cols-2 gap-2 w-full">
                           {/* HIGHER AUTHORITY VIEW: IF UNDER REVIEW, SHOW ONLY 2 ACTION BUTTONS */}
                           {isHigherRole && task.status === 'Review' ? (
                              <>
                                  <button 
                                      onClick={() => handleStatusClick(task._id, 'Need to Improve')}
                                      className="h-10 px-4 col-span-1 rounded-[5px] bg-rose-500/10 text-rose-500 border border-rose-500/50 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                                  >
                                      <AlertCircle size={14} /> IMPROVE
                                  </button>
                                  <button 
                                      onClick={() => handleStatusClick(task._id, 'Completed')}
                                      className="h-10 px-4 col-span-1 rounded-[5px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                                  >
                                      <CheckCircle2 size={14} /> COMPLETE
                                  </button>
                              </>
                          ) : (
                              /* STANDARD GRID: DYNAMIC BUTTON MAPPING */
                              [
                                  { s: 'Pending', c: 'bg-amber-500' },
                                  { s: 'Ongoing', c: 'bg-blue-500' },
                                  { s: 'Review', c: 'bg-[#ff4f00]' },
                                  ...(isHigherRole ? [{ s: 'Completed', c: 'bg-emerald-500' }] : [])
                              ].map((btn, idx) => (
                                  <button 
                                      key={btn.s}
                                      onClick={() => task._id && handleStatusClick(task._id, btn.s)}
                                      disabled={!task._id}
                                      className={`h-10 px-4 rounded-[5px] text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-1 shadow-lg ${isHigherRole && (btn.s === 'Completed' || btn.s === 'Review') ? 'col-span-2' : !isHigherRole && btn.s === 'Review' ? 'col-span-2' : 'col-span-1'} ${task.status === btn.s ? btn.c + ' text-white ring-2 ring-white/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                  >
                                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === btn.s ? 'bg-white' : btn.c}`}></div>
                                      <span>{btn.s}</span>
                                  </button>
                              ))
                          )}
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* MISSION PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                 <button 
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                   className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-[#ff4f00] text-white rounded-[5px] border border-white/10 transition-all disabled:opacity-20 disabled:hover:bg-white/5 cursor-pointer"
                 >
                    <ChevronLeft size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Previous</span>
                 </button>
                 
                 <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-[5px] text-[10px] font-black border transition-all cursor-pointer ${currentPage === i + 1 ? 'bg-[#ff4f00] border-[#ff4f00] text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                      >
                         {i + 1}
                      </button>
                    ))}
                 </div>

                 <button 
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages}
                   className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-[#ff4f00] text-white rounded-[5px] border border-white/10 transition-all disabled:opacity-20 disabled:hover:bg-white/5 cursor-pointer"
                 >
                    <span className="text-[10px] font-black uppercase tracking-widest">Next</span>
                    <ChevronRight size={16} />
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
