import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  User,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
    });

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, hrsRes] = await Promise.all([
                axios.get('/api/tasks/admin-all', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/personnel/hrs', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTasks(tasksRes.data);
            setEmployees(hrsRes.data); // Reusing employees state for HR list in form
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                ...formData,
                assignedToHR: formData.assignedTo
            };
            await axios.post('/api/tasks/create', taskData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Task Creation Failed');
        }
    };

    const handleDeleteTask = async (id) => {
        if(!window.confirm('Erase this task protocol from the registry?')) return;
        try {
            await axios.delete(`/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
        }
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
                        Mission Control & Assignment Registry
                    </p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#1E2026] text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-4"
                >
                    <Plus size={20} className="text-[#F0B90B]" />
                    Spawn New Task
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

            {/* TASK REGISTRY TABLE */}
            <div className="bg-white border border-[#E6E8EA] rounded-[32px] overflow-hidden shadow-2xl">
                <div className="p-8 bg-[#F5F5F5]/30 border-b border-[#E6E8EA] flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#1E2026] italic">Live Operational Trace</h3>
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#E6E8EA] w-full md:w-[400px]">
                        <Search size={18} className="text-[#848E9C]" />
                        <input 
                            type="text" 
                            placeholder="Trace protocol identifiers..." 
                            className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-[#1E2026] w-full" 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-30">
                        <div className="w-12 h-12 border-4 border-t-[#F0B90B] border-[#F2F2F2] rounded-full animate-spin"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em]">Synchronizing Registry...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5]/30">
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Mission Trace</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Current Node</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Priority Matrix</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">Workflow State</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em] text-right">Protocol Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E6E8EA]">
                                {tasks.map((task) => {
                                    const currentNode = task.assignedToEmployee || task.forwardedToManager || task.assignedToHR;
                                    return (
                                    <tr key={task._id} className="hover:bg-[#F9FAFC] transition-colors group">
                                        <td className="px-10 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-[#1E2026] group-hover:text-[#F0B90B] transition-colors uppercase leading-tight">
                                                    {task.title}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#848E9C] mt-2 flex items-center gap-2">
                                                    <Calendar size={12} className="text-[#F0B90B]" />
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E6E8EA] flex items-center justify-center text-[#1E2026] font-black text-xs">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-[#1E2026] tracking-tight leading-none mb-1">
                                                        {currentNode?.profile?.firstName} {currentNode?.profile?.lastName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest">{currentNode?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                                                task.priority === 'high' ? 'bg-[#F6465D]/10 text-[#F6465D]' :
                                                task.priority === 'medium' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                                                'bg-[#0ECB81]/10 text-[#0ECB81]'
                                            }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    task.status === 'completed' ? 'bg-[#0ECB81]' :
                                                    task.status === 'in_progress' ? 'bg-[#7000FF] animate-pulse' :
                                                    task.status === 'manager_assigned' ? 'bg-[#3E74FF]' :
                                                    task.status === 'hr_review' ? 'bg-[#F0B90B]' :
                                                    'bg-[#848E9C]'
                                                }`}></div>
                                                <span className="text-[11px] font-black text-[#1E2026] uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-3 bg-[#F2F2F2] rounded-xl text-[#1E2026] hover:bg-[#1E2026] hover:text-white transition-all"><Edit3 size={16} /></button>
                                                <button 
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-3 bg-[#F2F2F2] rounded-xl text-[#F6465D] hover:bg-[#F6465D] hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SPAWN MODAL (SYSTEM OVERRIDE) */}
            {showModal && (
                <div 
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
                >
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 cursor-default">
                        <div className="bg-[#222126] p-8 text-white relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F0B90B]/10 blur-[60px] -mr-24 -mt-24"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic relative z-10">Initialise <span className="text-[#F0B90B]">Task Node</span></h2>
                            <p className="text-[#848E9C] text-[9px] font-black uppercase tracking-[0.2em] mt-2 relative z-10">Assigning Mission Logic to Personnel</p>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4">Mission Designation</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Enter task title..."
                                        className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[14px] font-bold text-[#1E2026] outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4">Assign HR Node</label>
                                        <select 
                                            required
                                            className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold text-[#1E2026] outline-none"
                                            value={formData.assignedTo}
                                            onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                                        >
                                            <option value="">Select HR Segment</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.profile?.firstName} {emp.profile?.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4">Cycle Deadline</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold text-[#1E2026] outline-none"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4">Priority Logic</label>
                                    <div className="flex gap-3">
                                        {['low', 'medium', 'high'].map(p => (
                                            <button 
                                                key={p}
                                                type="button"
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
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4">Mission Description</label>
                                    <textarea 
                                        required
                                        placeholder="Enter context..."
                                        rows="2"
                                        className="w-full px-6 py-4 rounded-[16px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[13px] font-bold text-[#1E2026] outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-[16px] bg-[#F5F5F5] text-[#848E9C] text-[11px] font-black uppercase tracking-widest hover:bg-[#E6E8EA] transition-all"
                                >
                                    Eject
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-4 rounded-[16px] bg-[#F0B90B] text-[#1E2026] text-[11px] font-black uppercase tracking-widest hover:bg-[#FFD000] shadow-xl active:scale-[0.98] transition-all"
                                >
                                    Transmit Protocol
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
