import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, User, Calendar, ArrowRight, Activity, Briefcase, Zap,
  CheckCircle2, X, Target, Plus, Shield, Send, TrendingUp, AlertTriangle, ChevronDown
} from 'lucide-react';

const ManagerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    
    // New Task State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedToEmployee: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
    });

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, teamRes] = await Promise.all([
                axios.get('/api/tasks/team', { headers }),
                axios.get('/api/teams/my', { headers })
            ]);
            setTasks(tasksRes.data);
            setTeamMembers(teamRes.data?.members || []);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            await axios.post('/api/tasks/manager-create', newTask, { headers });
            setIsCreateModalOpen(false);
            setNewTask({
                title: '',
                description: '',
                assignedToEmployee: '',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (error) {
            console.error('Creation failed:', error);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="w-12 h-12 border-4 border-t-[#3E74FF] border-zinc-100 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Optimizing Personnel Routing...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-5xl font-black text-[#1E2026] tracking-tighter leading-none mb-3 italic uppercase">
                        Task <span className="text-[#3E74FF]">Deployment</span> Hub
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#3E74FF]"></span>
                        Manage team tasks and operational efficiency
                    </p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#1E2026] text-white px-10 py-5 rounded-full font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                  Create New Task
                </button>
            </div>

            {/* TASK CARDS HUB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tasks.map((task) => (
                    <div key={task._id} className="bg-white border border-[#E6E8EA] rounded-[40px] p-10 hover:shadow-2xl hover:border-[#3E74FF] transition-all group relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F5] rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-all"></div>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E6E8EA] flex items-center justify-center text-[#3E74FF] shadow-sm group-hover:bg-[#3E74FF] group-hover:text-white transition-all">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1E2026] uppercase tracking-tight leading-none mb-1">{task.title}</h3>
                                    <span className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-[#F0B90B]" />
                                        Target: {task.assignedToEmployee?.name || 'Unassigned'}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${
                                task.status === 'completed' ? 'bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/20' :
                                task.status === 'in_progress' ? 'bg-[#F0B90B]/10 text-[#F0B90B] border-[#F0B90B]/20' :
                                'bg-[#3E74FF]/10 text-[#3E74FF] border-[#3E74FF]/20'
                            }`}>
                                {task.status.replace('_', ' ')}
                            </span>
                        </div>

                        <p className="text-[15px] font-bold text-[#848E9C] mb-10 leading-relaxed font-mono italic flex-grow">"{task.description}"</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                           <div className="p-4 bg-[#F9FAFC] rounded-2xl border border-[#E6E8EA]">
                              <p className="text-[8px] font-black text-[#848E9C] uppercase mb-1">Priority</p>
                              <p className={`text-[11px] font-black uppercase ${task.priority === 'high' ? 'text-red-500' : 'text-[#1E2026]'}`}>{task.priority}</p>
                           </div>
                           <div className="p-4 bg-[#F9FAFC] rounded-2xl border border-[#E6E8EA]">
                              <p className="text-[8px] font-black text-[#848E9C] uppercase mb-1">Deadline</p>
                              <p className="text-[11px] font-black text-[#1E2026] tabular-nums">{new Date(task.dueDate).toLocaleDateString()}</p>
                           </div>
                           <div className="p-4 bg-[#F9FAFC] rounded-2xl border border-[#E6E8EA]">
                              <p className="text-[8px] font-black text-[#848E9C] uppercase mb-1">Assigned By</p>
                              <p className="text-[11px] font-black text-[#1E2026] uppercase truncate">{task.forwardedToManager?.name || 'SELF'}</p>
                           </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#1E2026] p-6 rounded-[24px]">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                 <TrendingUp size={14} className="text-[#0ECB81]" />
                              </div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Operational Trace: ACTIVE</span>
                           </div>
                           <ArrowRight size={18} className="text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all cursor-pointer" />
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE MISSION MODAL */}
            {isCreateModalOpen && (
                <div onClick={(e) => e.target === e.currentTarget && setIsCreateModalOpen(false)} className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                        <div className="bg-[#1E2026] p-12 text-white relative">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3E74FF]/10 blur-[120px] -mr-40 -mt-40 uppercase italic font-black text-white/5 text-[140px] leading-none pointer-events-none">MISSION</div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic relative z-10 leading-none mb-2">Create <span className="text-[#3E74FF]">New Task</span></h2>
                            <p className="text-[#848E9C] text-[11px] font-black uppercase tracking-[0.4em] relative z-10 italic">Assign a new task to a team member</p>
                            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-10 right-10 text-white/30 hover:text-white transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTask} className="p-14 space-y-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1 flex items-center gap-2">
                                        <Target size={14} className="text-[#3E74FF]" /> Task Title
                                    </label>
                                    <input 
                                        required
                                        placeholder="Enter task title"
                                        className="w-full p-4 bg-[#F5F5F5] rounded-2xl border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1 flex items-center gap-2">
                                        <Users size={14} className="text-[#3E74FF]" /> Assign To
                                    </label>
                                    <div className="relative">
                                        <select 
                                            required
                                            className="w-full p-4 pr-12 bg-[#F5F5F5] rounded-2xl border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all outline-none font-bold text-[14px] appearance-none cursor-pointer"
                                            value={newTask.assignedToEmployee}
                                            onChange={(e) => setNewTask({...newTask, assignedToEmployee: e.target.value})}
                                        >
                                            <option value="">Select Team Member</option>
                                            {teamMembers.map(m => (
                                                <option key={m._id} value={m._id}>{m.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1 flex items-center gap-2">
                                    <Briefcase size={14} className="text-[#3E74FF]" /> Task Description
                                </label>
                                <textarea 
                                    required
                                    rows="3"
                                    placeholder="Enter task details..."
                                    className="w-full p-5 bg-[#F5F5F5] rounded-[24px] border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all outline-none font-bold text-[14px] resize-none"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1 flex items-center gap-2">
                                        <Activity size={14} className="text-[#3E74FF]" /> Set Priority
                                    </label>
                                    <div className="relative">
                                        <select 
                                            required
                                            className="w-full p-4 pr-12 bg-[#F5F5F5] rounded-2xl border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all outline-none font-bold text-[14px] appearance-none cursor-pointer"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1 flex items-center gap-2">
                                        <Calendar size={14} className="text-[#3E74FF]" /> Due Date
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full p-4 bg-[#F5F5F5] rounded-2xl border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={creating}
                                className="w-full py-6 bg-[#3E74FF] text-white rounded-[24px] text-[13px] font-black uppercase tracking-[0.4em] hover:bg-[#1E2026] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {creating ? 'Creating Task...' : 'Create Task'} <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTasks;
