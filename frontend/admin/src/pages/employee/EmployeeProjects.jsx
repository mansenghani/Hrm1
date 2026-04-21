import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Target, Clock, CheckCircle2, Zap, ArrowUpRight, 
    MoreVertical, ExternalLink, Activity, Shield
} from 'lucide-react';

const EmployeeProjects = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchMissions = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/tasks/my', { headers });
            setTasks(res.data);
        } catch (error) {
            console.error('Mission Sync Failure:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleStatusUpdate = async (taskId, nextStatus) => {
        try {
            await axios.put(`/api/tasks/update-status/${taskId}`, { status: nextStatus }, { headers });
            fetchMissions();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="w-12 h-12 border-4 border-t-[#ff4f00] border-[#eceae3] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Active Arcs...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ff4f00] mb-2 italic">Assignment Terminal V4.2</p>
                    <h1 className="text-6xl font-black text-[#201515] tracking-tighter leading-none mb-3 italic uppercase">
                        Active <span className="text-[#ff4f00]">Arcs.</span>
                    </h1>
                    <p className="text-[#939084] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#ff4f00]"></span>
                        Strategic Mission Hub & Operational Quotas
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-[#eceae3]/50 p-2 rounded-2xl border border-[#c5c0b1]">
                    <div className="px-6 py-3 bg-white rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest mb-1">Total Payload</p>
                        <p className="text-xl font-black text-[#201515]">{tasks.length}</p>
                    </div>
                    <div className="px-6 py-3 bg-white rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest mb-1">In Execution</p>
                        <p className="text-xl font-black text-[#ff4f00]">{tasks.filter(t => t.status !== 'completed').length}</p>
                    </div>
                </div>
            </div>

            {/* MISSION GRID */}
            <div className="grid grid-cols-1 gap-8">
                {tasks.length === 0 ? (
                    <div className="p-32 bg-white border border-[#c5c0b1] rounded-[48px] flex flex-col items-center text-center shadow-sm">
                        <div className="w-24 h-24 bg-[#eceae3] rounded-3xl flex items-center justify-center text-[#939084] mb-8">
                            <Target size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-[#201515] uppercase italic tracking-tighter">No Active Arcs Detected</h3>
                        <p className="text-[#939084] font-bold text-[12px] mt-4 uppercase tracking-[0.3em]">Command awaiting tactical allocation</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div 
                            key={task._id} 
                            className="bg-white border border-[#c5c0b1] rounded-[48px] p-12 hover:border-[#ff4f00] transition-all group relative overflow-hidden shadow-sm hover:shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#eceae3] rounded-full -mr-32 -mt-32 opacity-20 group-hover:bg-[#ff4f00]/5 transition-all duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-4 h-4 rounded-full ${task.status === 'completed' ? 'bg-[#24a148] shadow-[0_0_12px_#24a148]' : 'bg-[#ff4f00] animate-pulse shadow-[0_0_12px_#ff4f00]'}`}></div>
                                        <div>
                                            <h3 className="text-4xl font-black text-[#201515] uppercase tracking-tighter leading-none italic group-hover:text-[#ff4f00] transition-colors">{task.title}</h3>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[10px] font-black text-[#939084] uppercase tracking-widest flex items-center gap-2">
                                                    <Activity size={14} /> ID: {task._id.substring(18)}
                                                </span>
                                                <span className="w-1 h-1 bg-[#c5c0b1] rounded-full"></span>
                                                <span className="text-[10px] font-black text-[#939084] uppercase tracking-widest flex items-center gap-2">
                                                    <Shield size={14} /> Criticality: Optimal
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold text-[#36342e] leading-relaxed max-w-4xl italic">
                                        "{task.description}"
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 shrink-0">
                                    <div className="text-right hidden md:block mr-6">
                                        <p className="text-[10px] font-black text-[#939084] uppercase tracking-widest mb-1">Sync Status</p>
                                        <p className={`text-[12px] font-black uppercase ${task.status === 'completed' ? 'text-[#24a148]' : 'text-[#ff4f00]'}`}>
                                            {task.status.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleStatusUpdate(task._id, task.status === 'completed' ? 'in_progress' : 'completed')}
                                        className={`px-12 py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-4 ${
                                            task.status === 'completed' 
                                            ? 'bg-[#24a148] text-white' 
                                            : 'bg-[#201515] text-white hover:bg-[#ff4f00]'
                                        }`}
                                    >
                                        {task.status === 'completed' ? (
                                            <>Verified <CheckCircle2 size={18} /></>
                                        ) : (
                                            <>Update Sync <Zap size={18} fill="white" /></>
                                        )}
                                    </button>
                                    <button className="w-14 h-14 rounded-2xl bg-[#eceae3] flex items-center justify-center text-[#201515] hover:bg-[#201515] hover:text-white transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="mt-12 h-1 bg-[#eceae3] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${task.status === 'completed' ? 'bg-[#24a148]' : 'bg-[#ff4f00]'}`}
                                    style={{ width: task.status === 'completed' ? '100%' : '65%' }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeProjects;
