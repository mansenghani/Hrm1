import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  User, 
  Calendar, 
  ArrowRight, 
  Activity, 
  Briefcase, 
  Zap,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';

const ManagerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    
    const token = sessionStorage.getItem('token');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, empsRes] = await Promise.all([
                axios.get('/api/tasks/manager', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/personnel/my-team', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTasks(tasksRes.data);
            setEmployees(empsRes.data);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            setAssigning(true);
            await axios.put(`/api/tasks/assign-employee/${selectedTask._id}`, { employeeId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTask(null);
            setEmployeeId('');
            fetchData();
        } catch (error) {
            console.error('Assignment failed:', error);
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="w-12 h-12 border-4 border-t-[#3E74FF] border-zinc-100 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Optimizing Personnel Routing...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-[#1E2026] tracking-tighter leading-none mb-3 italic uppercase">
                        Mission <span className="text-[#3E74FF]">Deployment</span> Matrix
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#3E74FF]"></span>
                        Manager-to-Personnel Assignment Gateway
                    </p>
                </div>
            </div>

            {/* TASK CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tasks.map((task) => (
                    <div key={task._id} className="bg-white border border-[#E6E8EA] rounded-[40px] p-10 hover:border-[#3E74FF] transition-all group relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#3E74FF] group-hover:bg-[#3E74FF]/10 transition-all border border-[#E6E8EA]">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1E2026] uppercase tracking-tight">{task.title}</h3>
                                    <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-[#F0B90B]" />
                                        Protocol Arc: {task.status.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                                task.status === 'hr_review' ? 'bg-[#3E74FF]/10 text-[#3E74FF] border-[#3E74FF]/20' : 'bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/20'
                            }`}>
                                {task.status === 'hr_review' ? 'Awaiting Personnel' : 'Operational'}
                            </span>
                        </div>

                        <p className="text-[14px] font-bold text-[#848E9C] mb-10 leading-relaxed flex-grow">{task.description}</p>

                        <div className="grid grid-cols-3 gap-6 mb-10 p-6 bg-[#F9FAFC] rounded-[24px] border border-[#F5F5F5]">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest mb-1">Source Node</p>
                                <p className="text-[11px] font-black text-[#1E2026] uppercase italic">HR UNIT</p>
                            </div>
                            <div className="text-center border-x border-[#E6E8EA]">
                                <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest mb-1">Priority</p>
                                <p className={`text-[11px] font-black uppercase ${task.priority === 'high' ? 'text-[#F6465D]' : 'text-[#3E74FF]'}`}>{task.priority}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[#848E9C] uppercase tracking-widest mb-1">Deadline</p>
                                <p className="text-[11px] font-black text-[#1E2026] tabular-nums">{new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {task.status === 'hr_review' ? (
                            <button 
                                onClick={() => setSelectedTask(task)}
                                className="w-full py-6 bg-[#1E2026] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#3E74FF] transition-all shadow-xl active:scale-95"
                            >
                                Deploy Personnel <ArrowRight size={16} />
                            </button>
                        ) : (
                            <div className="w-full py-6 bg-[#F5F5F5] text-[#848E9C] rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-dashed border-[#E6E8EA]">
                                Mission Transmitted <CheckCircle2 size={16} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ASSIGNMENT MODAL */}
            {selectedTask && (
                <div 
                    onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
                >
                    <div className="bg-white w-full max-w-xl rounded-[48px] shadow-[0_0_120px_rgba(62,116,255,0.2)] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 cursor-default">
                        <div className="bg-[#1E2026] p-12 text-white relative">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-[#3E74FF]/10 blur-[100px] -mr-32 -mt-32 uppercase italic font-black text-white/5 text-[120px]">SYNC</div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic relative z-10 leading-none mb-2">Deploy <span className="text-[#3E74FF]">Personnel</span></h2>
                            <p className="text-[#848E9C] text-[11px] font-black uppercase tracking-[0.3em] relative z-10 italic">Targeting Operational Node for Protocol Sync</p>
                            <button onClick={() => setSelectedTask(null)} className="absolute top-10 right-10 text-white/30 hover:text-white transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="p-14 space-y-10 text-center">
                            <div className="text-left space-y-6">
                                <label className="text-[12px] font-black uppercase tracking-[0.3em] text-[#848E9C] ml-6">Select Personnel Terminal</label>
                                <div className="relative group">
                                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-[#848E9C] group-focus-within:text-[#3E74FF] transition-colors">
                                        <Users size={20} />
                                    </div>
                                    <select 
                                        required
                                        className="w-full pl-16 pr-8 py-6 rounded-[28px] bg-[#F5F5F5] border-2 border-transparent focus:border-[#3E74FF] focus:bg-white transition-all text-[16px] font-bold text-[#1E2026] outline-none appearance-none cursor-pointer shadow-inner"
                                        value={employeeId}
                                        onChange={e => setEmployeeId(e.target.value)}
                                    >
                                        <option value="">Operational Nodes Only</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.profile?.firstName} {emp.profile?.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={assigning}
                                className="w-full py-7 bg-[#3E74FF] text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.4em] hover:bg-[#2D5BCC] shadow-[0_20px_50px_rgba(62,116,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {assigning ? 'Routing Logic...' : 'Authorize Protocol Sync'} <Zap size={22} fill="white" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTasks;
