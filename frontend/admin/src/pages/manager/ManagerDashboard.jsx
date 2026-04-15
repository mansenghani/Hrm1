import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Activity,
    CheckCircle,
    Target,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    User,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        team: [],
        tasks: [],
        loading: true
    });
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teamRes, taskRes] = await Promise.all([
                    axios.get('/api/personnel/my-team', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/tasks/manager', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats({
                    team: teamRes.data,
                    tasks: taskRes.data,
                    loading: false
                });
            } catch (error) {
                console.error('Core dump failed:', error);
            }
        };
        fetchStats();
    }, [token]);

    const pendingTasks = Array.isArray(stats.tasks) ? stats.tasks.filter(t => t?.status === 'hr_review' || t?.status === 'manager_assigned').length : 0;
    const completedTasks = Array.isArray(stats.tasks) ? stats.tasks.filter(t => t?.status === 'completed').length : 0;

    if (stats.loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="w-12 h-12 border-4 border-t-[#3E74FF] border-zinc-100 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Manager HUD...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-[#1E2026] tracking-tighter leading-none mb-3 italic">
                        Manager <span className="text-[#3E74FF]">Command</span>
                    </h1>
                    <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#3E74FF]"></span>
                        Team-Based Operational Hub
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-[#3E74FF]/10 text-[#3E74FF] rounded-full border border-[#3E74FF]/20 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#3E74FF] rounded-full animate-pulse"></div>
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Command Center: Online</span>
                    </div>
                </div>
            </div>

            {/* TELEMETRY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Team Nodes', val: String(stats.team?.length || 0).padStart(2, '0'), icon: Users, color: 'text-[#3E74FF]' },
                    { label: 'Pending Missions', val: String(pendingTasks).padStart(2, '0'), icon: Target, color: 'text-[#F0B90B]' },
                    { label: 'Completed Arcs', val: String(completedTasks).padStart(2, '0'), icon: CheckCircle, color: 'text-[#0ECB81]' }
                ].map((card, i) => (
                    <div key={i} className="bg-white p-10 border border-[#E6E8EA] rounded-[40px] hover:shadow-2xl transition-all group relative overflow-hidden active:scale-95 cursor-default">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5F5F5] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all opacity-40"></div>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className={`p-3 rounded-2xl bg-[#F5F5F5] ${card.color} group-hover:bg-white transition-all`}>
                                <card.icon size={24} />
                            </div>
                            <ArrowUpRight size={16} className="text-[#848E9C] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-5xl font-black text-[#1E2026] tabular-nums mb-2">{card.val}</h3>
                            <p className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.2em]">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* TEAM SECTION */}
                <div className="col-span-12 lg:col-span-7 bg-white border border-[#E6E8EA] rounded-[48px] p-12 shadow-sm">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-[13px] font-black text-[#1E2026] uppercase tracking-[0.4em] flex items-center gap-4 italic font-black">
                            <Users size={20} className="text-[#3E74FF]" />
                            Direct Command Team
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {!stats.team || stats.team.length === 0 ? (
                            <p className="text-center py-10 text-[11px] font-black text-[#848E9C] uppercase tracking-widest border-2 border-dashed border-[#F5F5F5] rounded-[24px]">No operational nodes assigned</p>
                        ) : (
                            stats.team.map((emp) => (
                                <div key={emp._id} className="flex items-center justify-between p-6 rounded-[32px] bg-[#F9FAFC] border border-[#E6E8EA] hover:border-[#3E74FF] transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-white border border-[#E6E8EA] flex items-center justify-center text-[#1E2026] font-black text-lg group-hover:bg-[#3E74FF] group-hover:text-white transition-all">
                                            {emp.profile?.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[16px] font-black text-[#1E2026] uppercase leading-none mb-1">{emp.profile?.firstName} {emp.profile?.lastName}</p>
                                            <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-[0.2em]">{emp.email}</p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white border border-[#E6E8EA] rounded-full text-[#848E9C] hover:text-[#3E74FF] hover:border-[#3E74FF] transition-all">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* TASK SUMMARY SECTION */}
                <div className="col-span-12 lg:col-span-5 bg-[#1E2026] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3E74FF]/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">Deployment Queue</h3>
                        <Activity size={20} className="text-[#F0B90B] animate-pulse" />
                    </div>

                    <div className="space-y-5 relative z-10">
                        {Array.isArray(stats.tasks) && stats.tasks.slice(0, 5).map((task) => (
                            <div key={task._id} className="p-6 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group cursor-pointer" onClick={() => navigate('/manager/tasks')}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[14px] font-black uppercase tracking-tight group-hover:text-[#3E74FF] transition-colors">{task.title}</h4>
                                    <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'bg-[#0ECB81]/20 text-[#0ECB81]' :
                                            task.status === 'in_progress' ? 'bg-[#7000FF]/20 text-[#7000FF]' :
                                                'bg-[#3E74FF]/20 text-[#3E74FF]'
                                        }`}>
                                        {task?.status?.split('_').join(' ') || 'UNKNOWN'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-[#848E9C] uppercase tracking-[0.2em]">Priority: {task.priority}</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                    <span className="text-[9px] font-bold text-[#848E9C] uppercase tracking-[0.2em]">Target: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/manager/tasks')}
                        className="w-full mt-10 py-6 bg-white flex items-center justify-center gap-3 rounded-[24px] text-[#1E2026] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#F0B90B] transition-all shadow-xl"
                    >
                        Enter Deployment Matrix <Zap size={16} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
