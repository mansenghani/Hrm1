import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Target, 
  User, 
  Calendar, 
  ArrowRight, 
  Activity, 
  Shield, 
  Zap,
  MoreVertical,
  X
} from 'lucide-react';

const HRTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [forwarding, setForwarding] = useState(false);
    const [managerId, setManagerId] = useState('');
    
    const token = sessionStorage.getItem('token');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, managersRes] = await Promise.all([
                axios.get('/api/tasks/hr', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/personnel/managers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTasks(tasksRes.data);
            setManagers(managersRes.data);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleForward = async (e) => {
        e.preventDefault();
        try {
            setForwarding(true);
            await axios.put(`/api/tasks/forward-to-manager/${selectedTask._id}`, { managerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTask(null);
            setManagerId('');
            fetchData();
        } catch (error) {
            console.error('Forward failed:', error);
        } finally {
            setForwarding(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="w-12 h-12 border-4 border-t-[#F0B90B] border-zinc-100 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Reviewing Protocol Arcs...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-[#1E2026] tracking-tighter leading-none mb-3 italic uppercase">
                        HR <span className="text-[#F0B90B]">Workflow</span> Hub
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
                        Mission Review & Forwarding Matrix
                    </p>
                </div>
            </div>

            {/* TASK GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map((task) => (
                    <div key={task._id} className="bg-white border border-[#E6E8EA] rounded-[32px] p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F5] rounded-full -mr-16 -mt-16 group-hover:bg-[#F0B90B]/10 transition-all"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                                    task.status === 'created' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' : 'bg-[#0ECB81]/10 text-[#0ECB81]'
                                }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                                <div className="p-2 rounded-lg bg-[#F5F5F5]">
                                    <Shield size={16} className="text-[#848E9C]" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-[#1E2026] uppercase tracking-tight mb-2 group-hover:text-[#F0B90B] transition-colors line-clamp-1">{task.title}</h3>
                            <p className="text-[12px] font-bold text-[#848E9C] mb-8 line-clamp-2 leading-relaxed">{task.description}</p>

                            <div className="space-y-4 mb-10 pt-6 border-t border-[#F5F5F5]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest text-[#F0B90B]">Initiated By</span>
                                    <span className="text-[11px] font-black text-[#1E2026] uppercase italic">ADMIN NODE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest text-[#F0B90B]">Timeline</span>
                                    <span className="text-[11px] font-black text-[#1E2026] tabular-nums">{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {task.status === 'created' ? (
                                <button 
                                    onClick={() => setSelectedTask(task)}
                                    className="w-full py-5 bg-[#1E2026] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    Review & Forward <ArrowRight size={14} />
                                </button>
                            ) : (
                                <div className="w-full py-5 bg-[#F5F5F5] text-[#848E9C] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                    In Management Review <Activity size={14} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* FORWARD MODAL */}
            {selectedTask && (
                <div 
                    onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
                >
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 cursor-default">
                        <div className="bg-[#1E2026] p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0B90B]/10 blur-[80px] -mr-32 -mt-32"></div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic relative z-10">Forward <span className="text-[#F0B90B]">Protocol</span></h2>
                            <p className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.3em] mt-3 relative z-10 italic">Targeting Management Node for Assignment</p>
                            <button onClick={() => setSelectedTask(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleForward} className="p-12 space-y-8 text-center">
                            <div className="p-8 rounded-[32px] bg-[#F5F5F5] border-2 border-dashed border-[#E6E8EA]">
                                <h4 className="text-[14px] font-black text-[#1E2026] uppercase mb-2 italic">"{selectedTask.title}"</h4>
                                <p className="text-[11px] font-bold text-[#848E9C] line-clamp-2">{selectedTask.description}</p>
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-6">Select Management Node</label>
                                <select 
                                    required
                                    className="w-full px-8 py-5 rounded-[24px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all text-[15px] font-bold text-[#1E2026] outline-none appearance-none cursor-pointer shadow-sm"
                                    value={managerId}
                                    onChange={e => setManagerId(e.target.value)}
                                >
                                    <option value="">Choose Management Tier</option>
                                    {managers.map(mgr => (
                                        <option key={mgr._id} value={mgr._id}>{mgr.name || mgr.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit"
                                disabled={forwarding}
                                className="w-full py-6 bg-[#F0B90B] text-[#1E2026] rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[#FFD000] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {forwarding ? 'Verifying Link...' : 'Synchronize with Manager'} <Zap size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRTasks;
