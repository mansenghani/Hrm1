import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Fingerprint, 
  Calendar, 
  Activity, 
  Rocket, 
  User, 
  Clock, 
  ArrowUpRight, 
  CheckCircle, 
  Bell, 
  ExternalLink,
  Target,
  Zap,
  MoreVertical,
  PlayCircle,
  CheckSquare
} from 'lucide-react';

const EmployeeDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/tasks/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (error) {
                console.error('Data pull failed:', error);
            } finally {
                setLoading(false);
            }
        };
        if(user._id) fetchMyData();
    }, [user._id, token]);

    const handleStatusUpdate = async (taskId, nextStatus) => {
        try {
            await axios.put(`/api/tasks/update-status/${taskId}`, { status: nextStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Re-fetch
            const response = await axios.get('/api/tasks/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

    const stats = [
        { label: 'Intelligence Profile', val: '100%', cap: 'Perfect Sync', icon: Fingerprint, color: 'text-[#0ECB81]' },
        { label: 'My Total Tasks', val: String(tasks.length).padStart(2, '0'), cap: 'Operational Arcs', icon: Activity, color: 'text-[#F0B90B]' },
        { label: 'Pending Missions', val: String(pendingTasks).padStart(2, '0'), cap: 'Active Pipelines', icon: Target, color: 'text-[#3E74FF]' },
        { label: 'Completed Arcs', val: String(completedTasks).padStart(2, '0'), cap: 'Verified Syncs', icon: CheckCircle, color: 'text-[#7000FF]' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-5xl font-black text-[#1E2026] tracking-tight leading-none mb-3 italic">
                        My <span className="text-[#F0B90B]">Workspace</span>
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
                        Personnel Activity Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-[#0ECB81]/10 text-[#0ECB81] rounded-full border border-[#0ECB81]/20">
                        <div className="w-1.5 h-1.5 bg-[#0ECB81] rounded-full animate-pulse"></div>
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Status: Linked</span>
                    </div>
                    <button className="p-3 bg-white border border-[#E6E8EA] rounded-xl hover:bg-[#F5F5F5] transition-all relative">
                        <Bell size={18} className="text-[#1E2026]" />
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F6465D] border-2 border-white rounded-full"></div>
                    </button>
                </div>
            </div>

            {/* INTELLIGENCE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 border border-[#E6E8EA] rounded-[24px] hover:shadow-xl transition-all group overflow-hidden relative active:scale-95 cursor-pointer">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#F5F5F5] rounded-full -mr-8 -mt-8 group-hover:bg-[#F0B90B] group-hover:scale-110 transition-all opacity-50"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`p-2.5 rounded-lg bg-[#F5F5F5] ${stat.color} group-hover:bg-white transition-all`}>
                                <stat.icon size={20} />
                            </div>
                            <ArrowUpRight size={14} className="text-[#848E9C] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-[#1E2026] tabular-nums mb-1">{stat.val}</h3>
                            <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-[0.1em]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* MISSION MATRIX */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="bg-white border border-[#E6E8EA] rounded-[32px] p-8 lg:p-12 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-[14px] font-black text-[#1E2026] uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                    <Target size={20} className="text-[#F0B90B]" />
                                    Active Mission Matrix
                                </h3>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                                <div className="w-8 h-8 border-2 border-t-[#F0B90B] border-zinc-100 rounded-full animate-spin"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Syncing Arcs...</span>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                <Zap size={32} className="mx-auto text-zinc-200 mb-4" />
                                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No active mission arcs assigned</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {tasks.map((task) => (
                                    <div key={task._id} className="p-8 rounded-[32px] bg-[#F9FAFC] border border-[#E6E8EA] hover:border-[#F0B90B] transition-all group">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        task.status === 'completed' ? 'bg-[#0ECB81]' : 
                                                        task.status === 'in_progress' ? 'bg-[#7000FF] animate-pulse' : 
                                                        'bg-[#3E74FF]'
                                                    }`}></div>
                                                    <h4 className="text-[18px] font-black text-[#1E2026] uppercase group-hover:text-[#F0B90B] transition-colors">{task.title}</h4>
                                                </div>
                                                <p className="text-[13px] font-bold text-[#848E9C] leading-snug">{task.description}</p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <span className="px-3 py-1 bg-white border border-[#E6E8EA] rounded text-[9px] font-black text-[#848E9C] uppercase tracking-widest">Priority: {task.priority}</span>
                                                    <span className="px-3 py-1 bg-white border border-[#E6E8EA] rounded text-[9px] font-black text-[#848E9C] uppercase tracking-widest">From: Manager Node</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 shrink-0">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest mb-1">Due Cycle</p>
                                                    <p className="text-[14px] font-black text-[#1E2026] tabular-nums">{new Date(task.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                
                                                {task.status === 'manager_assigned' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(task._id, 'in_progress')}
                                                        className="px-8 py-4 bg-[#1E2026] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:scale-105 shadow-xl active:scale-95 transition-all flex items-center gap-3"
                                                    >
                                                        Initiate <PlayCircle size={16} fill="white" />
                                                    </button>
                                                )}

                                                {task.status === 'in_progress' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(task._id, 'completed')}
                                                        className="px-8 py-4 bg-[#0ECB81] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0BA66A] hover:scale-105 shadow-xl active:scale-95 transition-all flex items-center gap-3"
                                                    >
                                                        Seal Protocol <CheckSquare size={16} />
                                                    </button>
                                                )}

                                                {task.status === 'completed' && (
                                                    <div className="px-8 py-4 bg-[#0ECB81]/10 text-[#0ECB81] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#0ECB81]/20 cursor-default">
                                                        Mission Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Hub */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-[#1E2026] rounded-[32px] p-10 text-white relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 blur-3xl rounded-full"></div>
                        <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em] mb-4">Internal Work Efficiency</p>
                        <h4 className="text-xl font-black mb-10">Network Sync Strength <span className="text-[#F0B90B]">82%</span></h4>
                        <div className="space-y-3">
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#F0B90B] shadow-[0_0_10px_rgba(240,185,11,0.5)] transition-all" style={{ width: '82%' }}></div>
                            </div>
                            <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest text-right">Target 100% Verified</p>
                        </div>
                    </div>

                    <div className="bg-[#F5F5F5]/50 border border-[#E6E8EA] rounded-3xl p-10">
                        <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em] mb-10 italic">Workspace Controls</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Claim Leave', icon: Calendar },
                                { label: 'Clock Trace', icon: Clock },
                                { label: 'Sync KPI', icon: Activity },
                                { label: 'Help Node', icon: User }
                            ].map((btn, idx) => (
                                <button key={idx} className="p-6 bg-white border border-[#E6E8EA] rounded-2xl group hover:border-[#F0B90B] transition-all text-center flex flex-col items-center gap-3 active:scale-95">
                                    <btn.icon size={20} className="text-[#848E9C] group-hover:text-[#F0B90B] transition-colors" />
                                    <span className="text-[10px] font-black text-[#1E2026] uppercase tracking-tight">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
