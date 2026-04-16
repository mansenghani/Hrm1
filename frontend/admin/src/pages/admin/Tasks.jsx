import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Edit3,
  User,
  Zap,
  BarChart3
} from 'lucide-react';

const Tasks = () => {
    // 🏷️ STATE MANAGEMENT (Requirement 2)
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedToHR: '',
        priority: 'medium',
        dueDate: ''
    });

    const token = sessionStorage.getItem('token');

    // 🚀 INITIAL MOUNT (Requirement 1)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const activeToken = sessionStorage.getItem('token');
        
        try {
            // Senior Trace: Concurrent API Execution
            const tasksCall = axios.get('/api/tasks/admin-all', { headers: { Authorization: `Bearer ${activeToken}` } });
            const hrsCall = axios.get('/api/personnel/hrs', { headers: { Authorization: `Bearer ${activeToken}` } });

            const [tasksRes, hrsRes] = await Promise.allSettled([tasksCall, hrsCall]);

            // Handling Task Results
            if (tasksRes.status === 'fulfilled') {
                setTasks(tasksRes.value.data);
            } else {
                console.warn('API Trace Failed: Missions Registry Offline');
            }

            // Handling HR Results (Requirement 4 & 5)
            if (hrsRes.status === 'fulfilled') {
                const incoming = hrsRes.value.data;
                const hrData = Array.isArray(incoming) ? incoming : (incoming.data || []);
                
                if (hrData.length > 0) {
                    setEmployees(hrData);
                    setError(null);
                } else {
                    handleMockInjection('Registry currently empty');
                }
            } else {
                const errorInfo = hrsRes.reason?.response?.data?.message || hrsRes.reason?.message || 'Network Sync Block';
                handleMockInjection(errorInfo);
            }
        } catch (err) {
            console.error('System Operational Failure:', err);
            handleMockInjection(err.message);
        } finally {
            // Ensure loading stops after response (Requirement 3)
            setLoading(false);
        }
    };

    // 🏗️ FALLBACK SOLUTION (Requirement 6)
    const handleMockInjection = (reason) => {
        console.warn(`Injecting Identity Mock: ${reason}`);
        setError(`Sync Error: ${reason}`); // Surface the actual reason
        setEmployees([
            { _id: 'mock-1', name: 'HR Manager 1 (Mock)', email: 'mock1@fluidhr.io' },
            { _id: 'mock-2', name: 'HR Manager 2 (Mock)', email: 'mock2@fluidhr.io' }
        ]);
        setLoading(false);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            console.log('[CLIENT TRACE] Transmitting Mission Payload:', formData);
            await axios.post('/api/tasks/create', formData, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            setFormData({ title: '', description: '', assignedToHR: '', priority: 'medium', dueDate: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Protocol Submission Failed');
        }
    };

    const handleDeleteTask = async (id) => {
        if(!window.confirm('Delete Mission Trace?')) return;
        try {
            await axios.delete(`/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) { console.error('Delete Error:', err); }
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        velocity: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3 uppercase italic">
                        Task <span className="text-[#F0B90B]">Orchestrator</span>
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
                        Mission Control Hub
                    </p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#1E2026] text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-4"
                >
                    <Plus size={20} className="text-[#F0B90B]" />
                    Spawn Mission
                </button>
            </div>

            {/* ANALYTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Missions', val: stats.total, icon: Zap, color: 'text-[#1E2026]', bg: 'bg-[#F2F2F2]' },
                    { label: 'Pending Sync', val: stats.pending, icon: Clock, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
                    { label: 'Verified Complete', val: stats.completed, icon: CheckCircle, color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
                    { label: 'Network Velocity', val: `${stats.velocity}%`, icon: BarChart3, color: 'text-[#3E74FF]', bg: 'bg-[#3E74FF]/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-7 border border-[#E6E8EA] rounded-[24px] flex items-center gap-6 group hover:shadow-xl transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                            <s.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[20px] font-black text-[#1E2026] tabular-nums">{s.val}</p>
                            <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* TASK TABLE */}
            <div className="bg-white border border-[#E6E8EA] rounded-[32px] overflow-hidden shadow-2xl">
                <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex justify-between items-center">
                    <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#1E2026] italic">Live Operational Trace</h3>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-6">
                        <div className="w-12 h-12 border-4 border-t-[#F0B90B] border-[#F2F2F2] rounded-full animate-spin"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Syncing Registry...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5]/30">
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Mission</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Assigned Node</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E6E8EA]">
                                {tasks.map((task) => {
                                    const node = task.assignedToHR || task.forwardedToManager || task.assignedToEmployee;
                                    return (
                                        <tr key={task._id} className="hover:bg-[#F9FAFC] transition-colors group">
                                            <td className="px-10 py-7">
                                                <span className="text-[14px] font-black text-[#1E2026] uppercase">{task.title}</span>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><User size={14}/></div>
                                                    <span className="text-[12px] font-bold text-[#1E2026]">{node?.name || node?.email || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <span className="px-3 py-1 bg-slate-100 rounded text-[10px] font-black uppercase tracking-widest">{task.status}</span>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <button onClick={() => handleDeleteTask(task._id)} className="text-[#F6465D] hover:scale-110 transition-all"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 🛠️ SPAWN MODAL (Requirement 5 & 7) */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="bg-[#1E2026] p-8 text-white">
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Initialise <span className="text-[#F0B90B]">Task Node</span></h2>
                            <p className="text-[#848E9C] text-[9px] font-black uppercase tracking-[0.2em] mt-2">Professional Personnel Assignment</p>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] ml-4">Mission Designation</label>
                                    <input 
                                        type="text" required placeholder="Enter task title..."
                                        className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[14px] font-bold outline-none"
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Assign HR Node</label>
                                            {error && <span className="text-[8px] font-black text-rose-500 uppercase">{error.includes('Mock') ? 'Mock Active' : 'Sync Error'}</span>}
                                        </div>
                                        <select 
                                            required
                                            className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold outline-none"
                                            value={formData.assignedToHR} onChange={e => setFormData({...formData, assignedToHR: e.target.value})}
                                        >
                                            {loading ? (
                                                <option>Synchronizing Registry...</option>
                                            ) : (
                                                <>
                                                    <option value="">Select HR Segment</option>
                                                    {employees.map(emp => (
                                                        <option key={emp._id} value={emp._id}>
                                                            {emp.name || emp.fullName || emp.email || 'Personnel Node'}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] ml-4">Cycle Deadline</label>
                                        <input 
                                            type="date" required
                                            className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold outline-none"
                                            value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] ml-4">Priority Logic</label>
                                    <div className="flex gap-3">
                                        {['low', 'medium', 'high'].map(p => (
                                            <button 
                                                key={p} type="button"
                                                onClick={() => setFormData({...formData, priority: p})}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                                    formData.priority === p 
                                                    ? 'bg-[#1E2026] text-white border-[#1E2026] shadow-lg' 
                                                    : 'bg-white text-[#848E9C] border-[#E6E8EA] hover:border-[#F0B90B]'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] ml-4">Mission Description</label>
                                    <textarea 
                                        required placeholder="Enter context..." rows="2"
                                        className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold outline-none resize-none"
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-[16px] bg-[#F5F5F5] text-[#848E9C] text-[11px] font-black uppercase tracking-widest">Eject</button>
                                <button type="submit" className="flex-[2] py-4 rounded-[16px] bg-[#F0B90B] text-[#1E2026] text-[11px] font-black uppercase tracking-widest hover:bg-[#FFD000] shadow-xl transition-all">Transmit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
