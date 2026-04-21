import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Clock, Play, Square, Pause, Calendar, CheckCircle, 
    AlertCircle, TrendingUp, Zap, Fingerprint, Activity,
    LayoutDashboard, User, Shield, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [timer, setTimer] = useState(0);
    const [session, setSession] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuth = () => {
        const token = sessionStorage.getItem('token');
        if (!token) return null;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchData = async () => {
        try {
            const auth = getAuth();
            if (!auth) {
                navigate('/login');
                return;
            }

            console.log('--- DASHBOARD RECOVERY SYNC ---');
            const [statusRes, tasksRes] = await Promise.all([
                axios.get('/api/time/status', auth).catch(() => ({ data: { hasActiveSession: false } })),
                axios.get('/api/tasks/my-tasks', auth).catch(() => ({ data: [] }))
            ]);

            console.log('Dashboard Status Payload:', statusRes.data);

            if (statusRes.data && statusRes.data.hasActiveSession) {
                const s = statusRes.data;
                const isRunning = s.isRunning !== undefined ? s.isRunning : (s.status === 'active');
                const totalActive = s.totalActiveTime || s.activeTime || 0;
                
                setSession({ ...s, isRunning, totalActiveTime: totalActive });

                if (isRunning && s.startTime) {
                    const elapsed = Math.floor((new Date() - new Date(s.startTime)) / 1000);
                    setTimer(elapsed + totalActive);
                } else {
                    setTimer(totalActive);
                }
            } else {
                setSession(null);
                setTimer(0);
            }

            setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        } catch (error) {
            console.error('Operational Sync Failure:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh stats every 60 seconds
        const refreshInterval = setInterval(fetchData, 60000);
        return () => clearInterval(refreshInterval);
    }, []);

    // 🛡️ HARDENED TIMER ENGINE (Synchronized with Tracker)
    useEffect(() => {
        let interval;
        if (session && session.isRunning && session.startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const start = new Date(session.startTime);
                const elapsedSinceStart = Math.floor((now - start) / 1000);
                setTimer(elapsedSinceStart + (session.totalActiveTime || 0));
            }, 1000);
        } else if (session) {
            setTimer(session.totalActiveTime || 0);
        } else {
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [session]);

    const formatTime = (seconds) => {
        const totalSecs = Math.max(0, parseInt(seconds) || 0);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleTrack = async (action) => {
        try {
            console.log(`Executing Dashboard Action: ${action}`);
            const auth = getAuth();
            if (!auth) {
                navigate('/login');
                return;
            }
            const config = { ...auth, timeout: 5000 };
            
            const res = await axios.post(`/api/time/${action}`, {}, config);
            console.log(`${action} Success:`, res.data);
            await fetchData();
        } catch (err) {
            console.error(`Dashboard Tracking Error (${action}):`, err);
            const msg = err.response?.data?.message || err.message || 'Action Interrupted';
            alert(`Trace Error: ${msg}\n\nCheck if your backend is running.`);
        }
    };

    const stats = [
        { label: 'Network Pulse', val: '100%', cap: 'Active', icon: Fingerprint, color: 'text-[#ff4f00]' },
        { label: 'Time Harvested', val: formatTime(timer).split(':')[0] + 'h', cap: 'Daily Yield', icon: Clock, color: 'text-[#ff4f00]' },
        { label: 'Sync Score', val: '98', cap: 'Verified', icon: Zap, color: 'text-[#24a148]' }
    ];

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <RefreshCw size={32} className="text-[#ff4f00] animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Intelligence Terminal...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-40 max-w-[1600px] mx-auto px-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#c5c0b1] pb-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ff4f00] mb-2 italic">Intelligence Terminal V4.2</p>
                    <h1 className="text-6xl font-black text-[#201515] tracking-tighter leading-none mb-3 italic uppercase">
                        Active <span className="text-[#ff4f00]">Workspace.</span>
                    </h1>
                    <p className="text-[#939084] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-[#ff4f00]"></span>
                        Personnel Activity Stream & Quota Tracking
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    className="h-12 px-6 bg-[#201515] text-[#fffefb] rounded-[4px] text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#ff4f00] transition-all shadow-lg cursor-pointer border-none"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Sync Registry
                </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-[#c5c0b1] p-10 rounded-[32px] group hover:border-[#ff4f00] transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-[#eceae3] group-hover:bg-[#ff4f00]/10 transition-colors ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[9px] font-black text-[#939084] uppercase tracking-widest italic">{stat.cap}</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[#201515] tabular-nums tracking-tighter mb-1 italic">{stat.val}</h3>
                            <p className="text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-12">
                {/* TRACKING & ANALYTICS */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* BIG TIMER CARD */}
                    <div className={`rounded-[40px] py-12 px-14 transition-all duration-700 relative overflow-hidden group shadow-2xl border ${
                        session?.isRunning ? 'bg-[#fffdf9] border-[#24a148]' : 'bg-[#201515] border-transparent text-white'
                    }`}>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="text-center lg:text-left">
                                <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                                    <div className={`w-2 h-2 rounded-full ${session?.isRunning ? 'bg-[#24a148] animate-pulse' : 'bg-[#939084]'}`}></div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.5em] italic ${session?.isRunning ? 'text-[#201515]' : 'text-white/60'}`}>
                                        {session?.isRunning ? 'Actively Monitoring' : 'Session Paused'}
                                    </p>
                                </div>
                                <h2 className={`text-[60px] md:text-[80px] font-black tabular-nums leading-none tracking-tighter italic select-none ${session?.isRunning ? 'text-[#201515]' : 'text-white'}`}>
                                    {formatTime(timer)}
                                </h2>
                                <p className={`text-[11px] font-bold mt-4 uppercase tracking-[0.3em] ${session?.isRunning ? 'text-[#939084]' : 'text-white/40'}`}>Active Operational Yield</p>
                            </div>

                            <div className="flex flex-col gap-6 w-full lg:w-auto">
                                {!session ? (
                                    <button 
                                        onClick={() => handleTrack('start')}
                                        className="bg-[#ff4f00] text-white h-16 px-10 rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl border-none cursor-pointer"
                                    >
                                        START <Play size={20} fill="white" />
                                    </button>
                                ) : (
                                    <div className="flex flex-row gap-3">
                                        {!session.isRunning ? (
                                            <button 
                                                onClick={() => handleTrack('resume')}
                                                className="bg-[#24a148] text-white h-14 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                                            >
                                                RESUME <Play size={16} fill="white" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleTrack('pause')}
                                                className="bg-[#fffefb] text-[#201515] h-14 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#eceae3] transition-all border-none cursor-pointer shadow-lg"
                                            >
                                                PAUSE <Pause size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleTrack('stop')}
                                            className="bg-[#ff4f00] text-white h-14 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                                        >
                                            STOP <Square size={16} fill="white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY */}
                    <div className="bg-white border border-[#c5c0b1] rounded-[40px] p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic">Active Assignments</h3>
                            <TrendingUp size={18} className="text-[#ff4f00]" />
                        </div>
                        <div className="space-y-6">
                            {tasks.length === 0 ? (
                                <p className="text-[10px] text-[#939084] uppercase font-black tracking-widest italic text-center py-10 opacity-40">No pending task nodes in registry</p>
                            ) : (
                                tasks.slice(0, 4).map((task, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-[#fffdf9] border border-[#eceae3] rounded-2xl hover:border-[#ff4f00] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-[#201515] text-white flex items-center justify-center font-black italic">
                                                {task.title?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-black text-[#201515] uppercase tracking-tight">{task.title}</h4>
                                                <p className="text-[10px] font-bold text-[#939084] uppercase tracking-widest">{task.status || 'Pending'}</p>
                                            </div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-[#24a148]' : 'bg-[#ff4f00]'}`}></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR WIDGETS */}
                <div className="col-span-12 lg:col-span-4 space-y-12">
                    <div className="bg-[#fffdf9] border border-[#c5c0b1] p-10 rounded-[40px] shadow-sm">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic mb-10 flex items-center gap-3">
                            <Shield size={18} className="text-[#ff4f00]" />
                            Security Pulse
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Auth Token', val: 'Verified', icon: CheckCircle },
                                { label: 'Session Integrity', val: 'High', icon: Fingerprint },
                                { label: 'Node Sync', val: 'Active', icon: Activity }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white border border-[#c5c0b1] rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <item.icon size={16} className="text-[#ff4f00]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-[#24a148] uppercase italic">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
