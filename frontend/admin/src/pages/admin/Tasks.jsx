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
  BarChart3,
  RefreshCw,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const Tasks = () => {
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const activeToken = sessionStorage.getItem('token');
        
        try {
            const tasksCall = axios.get('/api/tasks/admin-all', { headers: { Authorization: `Bearer ${activeToken}` } });
            const hrsCall = axios.get('/api/personnel/hrs', { headers: { Authorization: `Bearer ${activeToken}` } });

            const [tasksRes, hrsRes] = await Promise.allSettled([tasksCall, hrsCall]);

            if (tasksRes.status === 'fulfilled') {
                setTasks(Array.isArray(tasksRes.value.data) ? tasksRes.value.data : []);
            } else {
                console.warn('Tasks Registry Offline');
            }

            if (hrsRes.status === 'fulfilled') {
                const incoming = hrsRes.value.data;
                const hrData = Array.isArray(incoming) ? incoming : (incoming.data || []);
                setEmployees(hrData);
            }
        } catch (err) {
            console.error('System Failure:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tasks/create', formData, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            setFormData({ title: '', description: '', assignedToHR: '', priority: 'medium', dueDate: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Submission Failed');
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
        pending: tasks.filter(t => t?.status === 'pending').length,
        completed: tasks.filter(t => t?.status === 'completed').length,
        velocity: tasks.length > 0 ? Math.round((tasks.filter(t => t?.status === 'completed').length / tasks.length) * 100) : 0
    };

    return (
        <div className="animate-fade-in pb-32">
            {/* HEADER */}
            <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
                <div>
                    <p className="zap-caption-upper text-[#ff4f00] mb-4">Operational Deployment</p>
                    <h1 className="zap-display-hero">Task <span className="text-[#ff4f00]">Orchestrator.</span></h1>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="zap-btn zap-btn-orange h-14 px-8"
                >
                    <Plus size={18} className="mr-3" />
                    Spawn Mission
                </button>
            </div>

            {/* ANALYTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Total Missions', val: stats.total, icon: Zap, status: 'Active' },
                    { label: 'Pending Sync', val: stats.pending, icon: Clock, status: 'Processing' },
                    { label: 'Verified Complete', val: stats.completed, icon: CheckCircle, status: 'Success' },
                    { label: 'Network Velocity', val: `${stats.velocity}%`, icon: BarChart3, status: 'Optimal' },
                ].map((s, i) => (
                    <div key={i} className="zap-card group hover:border-[#201515] transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-[#fffefb] transition-all">
                                <s.icon size={20} />
                            </div>
                            <span className="text-[11px] font-bold text-[#ff4f00] uppercase tracking-widest">{s.status}</span>
                        </div>
                        <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider mb-2">{s.label}</p>
                        <h3 className="text-[32px] font-medium text-[#201515] leading-none tabular-nums">{s.val}</h3>
                    </div>
                ))}
            </div>

            {/* TASK TABLE */}
            <div className="zap-card p-0 overflow-hidden">
                <div className="p-8 bg-[#fffdf9] border-b border-[#c5c0b1] flex justify-between items-center">
                    <h3 className="text-[14px] font-black uppercase tracking-widest text-[#201515]">Live Operational Trace</h3>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
                        <p className="zap-caption-upper text-[#939084]">Syncing Registry...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#c5c0b1] bg-[#fffdf9]">
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Mission</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Assigned Node</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c5c0b1]">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <p className="text-[15px] font-medium text-[#939084]">No active operational missions detected.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => {
                                        const node = task?.assignedToHR || task?.forwardedToManager || task?.assignedToEmployee;
                                        return (
                                            <tr key={task?._id} className="hover:bg-[#fffdf9] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="text-[15px] font-bold text-[#201515] uppercase">{task?.title || 'Unknown Mission'}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#eceae3] flex items-center justify-center text-[#939084]"><User size={14}/></div>
                                                        <span className="text-[13px] font-bold text-[#201515]">{node?.name || node?.fullName || node?.email || 'Unassigned'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${task?.status === 'completed' ? 'bg-[#24a148] text-white' : 'bg-[#eceae3] text-[#201515]'}`}>
                                                        {task?.status || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteTask(task?._id)} 
                                                        className="w-10 h-10 flex items-center justify-center text-[#ff4f00] hover:bg-[#ff4f00] hover:text-[#fffefb] rounded-[4px] transition-all bg-transparent border-none cursor-pointer"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SPAWN MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#201515]/20 backdrop-blur-sm">
                    <div className="bg-[#fffefb] w-full max-w-xl rounded-[8px] border border-[#c5c0b1] shadow-xl overflow-hidden animate-fade-in">
                        <div className="bg-[#201515] p-8 text-[#fffefb]">
                            <h2 className="text-[28px] font-medium leading-none mb-3">Initialise <span className="text-[#ff4f00]">Task Node</span></h2>
                            <p className="zap-caption-upper !text-[#939084]">Personnel Assignment Protocol</p>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="zap-caption-upper text-[#201515]">Mission Designation</label>
                                    <input 
                                        type="text" required placeholder="Enter task title..."
                                        className="w-full h-14 px-5 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00]"
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="zap-caption-upper text-[#201515]">Assign Node</label>
                                        <select 
                                            required
                                            className="w-full h-14 px-5 bg-white border border-[#c5c0b1] rounded-[4px] text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00] cursor-pointer"
                                            value={formData.assignedToHR} onChange={e => setFormData({...formData, assignedToHR: e.target.value})}
                                        >
                                            <option value="">Select Segment</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.name || emp.fullName || emp.email || 'Personnel Node'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="zap-caption-upper text-[#201515]">Cycle Deadline</label>
                                        <input 
                                            type="date" required
                                            className="w-full h-14 px-5 bg-white border border-[#c5c0b1] rounded-[4px] text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00]"
                                            value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="zap-caption-upper text-[#201515]">Priority Logic</label>
                                    <div className="flex gap-4">
                                        {['low', 'medium', 'high'].map(p => (
                                            <button 
                                                key={p} type="button"
                                                onClick={() => setFormData({...formData, priority: p})}
                                                className={`flex-1 h-12 rounded-[4px] text-[11px] font-bold uppercase tracking-widest border transition-all ${
                                                    formData.priority === p 
                                                    ? 'bg-[#201515] text-[#fffefb] border-[#201515]' 
                                                    : 'bg-white text-[#939084] border-[#c5c0b1] hover:border-[#ff4f00]'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="zap-caption-upper text-[#201515]">Mission Description</label>
                                    <textarea 
                                        required placeholder="Enter context..." rows="3"
                                        className="w-full p-5 bg-white border border-[#c5c0b1] rounded-[4px] text-[14px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] resize-none"
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="zap-btn zap-btn-light flex-1">Eject</button>
                                <button type="submit" className="zap-btn zap-btn-orange flex-[2]">Transmit Mission</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
