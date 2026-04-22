import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Calendar, Clock, CheckCircle, 
  Trash2, User, Zap, BarChart3, RefreshCw, X
} from 'lucide-react';
import TaskDetail from '../../components/TaskDetail';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedManager: '',
        priority: 'medium',
        dueDate: ''
    });

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async (silentParam = false) => {
        const silent = silentParam === true;
        try {
            if (!silent) setLoading(true);
            const [tasksRes, allRes] = await Promise.all([
                axios.get('/api/tasks/all', { headers }).catch(e => ({ data: [] })),
                axios.get('/api/personnel/all', { headers }).catch(e => ({ data: [] }))
            ]);
            setTasks(tasksRes.data || []);
            setLeads(Array.isArray(allRes.data) ? allRes.data : []);
        } catch (err) { console.error('Registry offline:', err); }
        finally { if (!silent) setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tasks/create', formData, { headers });
            setShowModal(false);
            setFormData({ title: '', description: '', assignedManager: '', priority: 'medium', dueDate: '' });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Transmission Failed'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Eject Mission Trace?')) return;
        try {
            await axios.delete(`/api/tasks/${id}`, { headers });
            fetchData();
        } catch (err) { console.error('Delete error:', err); }
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        velocity: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };

    return (
        <div className="animate-fade-in pb-32">
            {/* HEADER */}
            <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
                <div>
                    <p className="zap-caption-upper text-[#ff4f00] mb-4">Task Management</p>
                    <h1 className="zap-display-hero">Create <span className="text-[#ff4f00]">Task.</span></h1>
                </div>
                <button onClick={() => setShowModal(true)} className="zap-btn zap-btn-orange h-14 px-8">
                    <Plus size={18} className="mr-3" /> Create Task
                </button>
            </div>

            {/* ANALYTICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                {[
                    { label: 'Total Tasks', val: stats.total, icon: Zap },
                    { label: 'Active Tasks', val: stats.pending, icon: Clock },
                    { label: 'Completed', val: stats.completed, icon: CheckCircle },
                    { label: 'Efficiency', val: `${stats.velocity}%`, icon: BarChart3 },
                ].map((s, i) => (
                    <div key={i} className="zap-card group hover:border-[#201515] transition-all">
                        <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-white transition-all mb-8">
                            <s.icon size={20} />
                        </div>
                        <h3 className="text-[32px] font-medium text-[#201515] tabular-nums mb-2">{s.val}</h3>
                        <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* LIST */}
            <div className="zap-card p-0 overflow-hidden">
                <div className="p-8 bg-[#fffdf9] border-b border-[#c5c0b1] flex justify-between items-center">
                    <h3 className="text-[14px] font-black uppercase tracking-widest text-[#201515]">Task Registry</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Task Name</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Manager</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c5c0b1]">
                            {tasks.map(task => (
                                <tr key={task._id} onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }} className="hover:bg-[#fffdf9] transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <span className="text-[15px] font-bold text-[#201515] uppercase italic">{task.title}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#eceae3] flex items-center justify-center text-[#939084]"><User size={14}/></div>
                                            <span className="text-[13px] font-bold text-[#201515] uppercase italic">{task.assignedManager?.name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${task.status === 'completed' ? 'bg-[#24a148] text-white' : 'bg-[#201515] text-white'}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleDelete(task._id)} className="w-10 h-10 flex items-center justify-center text-[#ff4f00] hover:bg-[#ff4f00] hover:text-white rounded-[4px] transition-all bg-transparent border-none">
                                            <Trash2 size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-[#201515]/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl border border-[#c5c0b1] animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-[#eceae3] bg-[#fffdf9] flex justify-between items-center">
                            <h3 className="text-xl font-black text-[#201515] uppercase italic tracking-tighter">Create <span className="text-[#ff4f00]">Task.</span></h3>
                            <button onClick={() => setShowModal(false)} className="text-[#939084] hover:text-[#ff4f00] bg-transparent border-none cursor-pointer"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#939084] ml-1 italic">Task Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-11 px-4 bg-[#eceae3] rounded-xl text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/20 transition-all italic" placeholder="Enter task title..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#939084] ml-1 italic">Lead Personnel</label>
                                    <select required value={formData.assignedManager} onChange={e => setFormData({...formData, assignedManager: e.target.value})} className="w-full h-11 px-4 bg-[#eceae3] rounded-xl text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/20 transition-all italic appearance-none">
                                        <option value="">Select</option>
                                        {leads?.map(m => <option key={m._id} value={m._id}>{m.name || m.fullName || 'Unknown'} ({m.role?.toUpperCase() || 'N/A'})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#939084] ml-1 italic">Due Date</label>
                                    <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full h-11 px-4 bg-[#eceae3] rounded-xl text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/20 transition-all italic" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#939084] ml-1 italic">Task Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-[#eceae3] rounded-2xl text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/20 transition-all italic h-24 resize-none" placeholder="Provide details..." />
                            </div>
                            <button type="submit" className="w-full h-12 bg-[#201515] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#ff4f00] transition-all italic shadow-lg">Create New Task</button>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {selectedTask && (
                <TaskDetail 
                    task={tasks.find(t => t._id === selectedTask._id) || selectedTask}
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    onUpdate={() => fetchData(true)}
                    userRole="admin"
                />
            )}
        </div>
    );
};

export default Tasks;
